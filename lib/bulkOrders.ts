/**
 * Bulk order CSV/Excel parsing + auto-split aggregation for the bulk upload
 * tab. Everything here runs client-side — no upload endpoint, matching the
 * app's "zero backend" architecture.
 */

import { readSheet } from "read-excel-file/browser";
import writeXlsxFile from "write-excel-file/browser";

import {
  type CalculatorInput,
  type CourierName,
  type CourierResult,
  type GenericLocation,
  REPRESENTATIVE_DISTRICT_FOR_GENERIC,
  CANONICAL_DISTRICT,
  getAllQuotes,
} from "@/lib/courierCalculators";

export interface BulkOrderRow extends CalculatorInput {
  rowNumber: number;
  orderId: string;
}

export interface BulkOrderResult extends BulkOrderRow {
  quotes: CourierResult[];
  best: CourierResult;
}

export interface BulkParseError {
  rowNumber: number;
  message: string;
}

export interface BulkParseOutcome {
  rows: BulkOrderRow[];
  errors: BulkParseError[];
}

export interface BulkCourierTotal {
  courier: CourierName;
  total: number;
  orderCount: number;
}

export interface BulkSummary {
  totalOrders: number;
  autoSplitTotal: number;
  perCourierTotals: BulkCourierTotal[];
  bestSingleCourier: BulkCourierTotal | null;
  savings: number;
  savingsPct: number;
}

const TEMPLATE_HEADER = ["order_id", "location", "weight_kg", "product_price", "cod"];

const HEADER_ALIASES: Record<string, string> = {
  orderid: "order_id",
  order: "order_id",
  id: "order_id",
  reference: "order_id",
  ref: "order_id",
  location: "location",
  zone: "location",
  deliverylocation: "location",
  destination: "location",
  weightkg: "weight_kg",
  weight: "weight_kg",
  kg: "weight_kg",
  productprice: "product_price",
  price: "product_price",
  value: "product_price",
  amount: "product_price",
  cod: "cod",
  iscod: "cod",
  cashondelivery: "cod",
};

const LOCATION_LOOKUP: Record<string, GenericLocation> = {
  insidedhaka: "INSIDE_DHAKA",
  dhaka: "INSIDE_DHAKA",
  samecity: "INSIDE_DHAKA",
  suburb: "SUBURBS",
  suburbs: "SUBURBS",
  dhakasuburb: "SUBURBS",
  outsidedhaka: "OUTSIDE_DHAKA",
  outside: "OUTSIDE_DHAKA",
  intercity: "OUTSIDE_DHAKA",
};

const TRUTHY_COD = new Set(["yes", "y", "true", "1", "cod"]);
const FALSY_COD = new Set(["no", "n", "false", "0", ""]);

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Minimal RFC 4180 CSV parser — handles quoted fields, escaped quotes, and CRLF. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((cells) => cells.some((cell) => cell.trim() !== ""));
}

/** Shared by both the CSV and Excel parsers — everything downstream of "a grid of cells". */
function processTable(table: string[][]): BulkParseOutcome {
  if (table.length === 0) {
    return { rows: [], errors: [{ rowNumber: 0, message: "The file is empty." }] };
  }

  const [headerCells, ...dataRows] = table;
  const columnIndex: Partial<Record<string, number>> = {};
  headerCells.forEach((cell, index) => {
    const canonical = HEADER_ALIASES[normalizeKey(cell)];
    if (canonical) columnIndex[canonical] = index;
  });

  const missing = ["location", "weight_kg", "product_price"].filter(
    (key) => columnIndex[key] === undefined,
  );
  if (missing.length > 0) {
    return {
      rows: [],
      errors: [
        {
          rowNumber: 0,
          message: `Couldn't find required column(s): ${missing.join(", ")}. Download the template and match its headers.`,
        },
      ],
    };
  }

  const rows: BulkOrderRow[] = [];
  const errors: BulkParseError[] = [];

  dataRows.forEach((cells, dataIndex) => {
    const rowNumber = dataIndex + 2; // +1 for 1-based, +1 for header row
    const cell = (key: string) => {
      const index = columnIndex[key];
      return index === undefined ? "" : (cells[index] ?? "").trim();
    };

    const locationRaw = cell("location");
    const location = LOCATION_LOOKUP[normalizeKey(locationRaw)];
    if (!location) {
      errors.push({
        rowNumber,
        message: `Unrecognized location "${locationRaw}" — use Inside Dhaka, Suburbs, or Outside Dhaka.`,
      });
      return;
    }

    const weightKg = Number(cell("weight_kg"));
    if (!Number.isFinite(weightKg) || weightKg <= 0) {
      errors.push({ rowNumber, message: `Invalid weight "${cell("weight_kg")}" — must be a number greater than 0.` });
      return;
    }

    const productPrice = Number(cell("product_price"));
    if (!Number.isFinite(productPrice) || productPrice < 0) {
      errors.push({ rowNumber, message: `Invalid product price "${cell("product_price")}" — must be a number.` });
      return;
    }

    const codRaw = normalizeKey(cell("cod"));
    let isCOD = false;
    if (TRUTHY_COD.has(codRaw)) {
      isCOD = true;
    } else if (!FALSY_COD.has(codRaw)) {
      errors.push({ rowNumber, message: `Invalid COD value "${cell("cod")}" — use yes or no.` });
      return;
    }

    const orderId = cell("order_id") || `Row ${rowNumber}`;

    // Bulk rows don't carry a pickup or a real destination district yet —
    // every row ships from the Dhaka hub (matching Pathao/RedX/CarryBee's
    // Dhaka-only assumption), and the generic zone stands in for a real
    // Steadfast destination via a representative district.
    rows.push({
      rowNumber,
      orderId,
      location,
      weightKg,
      productPrice,
      isCOD,
      pickupDistrictId: CANONICAL_DISTRICT.DHAKA,
      deliveryDistrictId: REPRESENTATIVE_DISTRICT_FOR_GENERIC[location],
    });
  });

  return { rows, errors };
}

export function parseBulkOrdersCsv(text: string): BulkParseOutcome {
  return processTable(parseCsv(text));
}

export async function parseBulkOrdersXlsx(file: File | Blob | ArrayBuffer): Promise<BulkParseOutcome> {
  try {
    const sheetData = await readSheet(file);
    const table = sheetData.map((row) => row.map((cell) => (cell == null ? "" : String(cell))));
    return processTable(table);
  } catch {
    return {
      rows: [],
      errors: [{ rowNumber: 0, message: "Couldn't read this Excel file — make sure it's a valid .xlsx file." }],
    };
  }
}

export function computeBulkResults(rows: BulkOrderRow[]): BulkOrderResult[] {
  return rows.map((row) => {
    const quotes = getAllQuotes(row);
    return { ...row, quotes, best: quotes[0] };
  });
}

export function summarizeBulkResults(results: BulkOrderResult[]): BulkSummary {
  if (results.length === 0) {
    return {
      totalOrders: 0,
      autoSplitTotal: 0,
      perCourierTotals: [],
      bestSingleCourier: null,
      savings: 0,
      savingsPct: 0,
    };
  }

  const autoSplitTotal = results.reduce((sum, result) => sum + result.best.totalCharge, 0);

  const courierNames = results[0].quotes.map((quote) => quote.courier);
  const perCourierTotals: BulkCourierTotal[] = courierNames.map((courier) => {
    let total = 0;
    let orderCount = 0;
    for (const result of results) {
      const quote = result.quotes.find((q) => q.courier === courier);
      if (quote) total += quote.totalCharge;
      if (result.best.courier === courier) orderCount += 1;
    }
    return { courier, total, orderCount };
  });

  const bestSingleCourier = perCourierTotals.reduce<BulkCourierTotal | null>(
    (best, entry) => (best === null || entry.total < best.total ? entry : best),
    null,
  );

  const savings = bestSingleCourier ? bestSingleCourier.total - autoSplitTotal : 0;
  const savingsPct = bestSingleCourier && bestSingleCourier.total > 0 ? (savings / bestSingleCourier.total) * 100 : 0;

  return { totalOrders: results.length, autoSplitTotal, perCourierTotals, bestSingleCourier, savings, savingsPct };
}

// Same dummy rows for both template formats.
const TEMPLATE_EXAMPLE_ROWS = [
  ["ORD-1001", "Inside Dhaka", 0.5, 1200, "yes"],
  ["ORD-1002", "Suburbs", 1.2, 850, "no"],
  ["ORD-1003", "Outside Dhaka", 2.5, 2400, "yes"],
];

export function generateBulkTemplateCsv(): string {
  return [TEMPLATE_HEADER, ...TEMPLATE_EXAMPLE_ROWS]
    .map((row) => row.join(","))
    .join("\n");
}

export function generateBulkTemplateXlsxBlob(): Promise<Blob> {
  const sheetData = [TEMPLATE_HEADER, ...TEMPLATE_EXAMPLE_ROWS];
  return writeXlsxFile(sheetData).toBlob();
}

const RESULTS_HEADER = [
  "order_id",
  "location",
  "weight_kg",
  "product_price",
  "cod",
  "assigned_courier",
  "courier_zone",
  "charge_bdt",
];

export function bulkResultsToCsv(results: BulkOrderResult[]): string {
  const rows = results.map((result) => [
    result.orderId,
    result.location,
    String(result.weightKg),
    String(result.productPrice),
    result.isCOD ? "yes" : "no",
    result.best.courier,
    result.best.zoneLabel,
    String(result.best.totalCharge),
  ]);
  return [RESULTS_HEADER, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
}

export function bulkResultsToXlsxBlob(results: BulkOrderResult[]): Promise<Blob> {
  const rows = results.map((result) => [
    result.orderId,
    result.location,
    result.weightKg,
    result.productPrice,
    result.isCOD ? "yes" : "no",
    result.best.courier,
    result.best.zoneLabel,
    result.best.totalCharge,
  ]);
  return writeXlsxFile([RESULTS_HEADER, ...rows]).toBlob();
}

function csvEscape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}
