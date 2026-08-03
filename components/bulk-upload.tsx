"use client";

import { useCallback, useRef, useState } from "react";
import {
  AlertTriangle,
  Bike,
  Download,
  FileSpreadsheet,
  Trash2,
  Upload,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type BulkOrderResult,
  type BulkParseError,
  bulkResultsToCsv,
  bulkResultsToXlsxBlob,
  computeBulkResults,
  generateBulkTemplateCsv,
  generateBulkTemplateXlsxBlob,
  parseBulkOrdersCsv,
  parseBulkOrdersXlsx,
  summarizeBulkResults,
} from "@/lib/bulkOrders";
import { COURIER_ICON_COLOR } from "@/lib/courierCalculators";
import { useLanguage } from "@/lib/language-store";
import { addLifetimeSavings } from "@/lib/savings-store";
import { useCountUp } from "@/lib/use-count-up";
import { cn, formatBDT } from "@/lib/utils";

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadTextFile(filename: string, content: string) {
  downloadBlob(filename, new Blob([content], { type: "text/csv;charset=utf-8;" }));
}

const EXCEL_EXTENSION_RE = /\.xlsx?$/i;

export function BulkUpload() {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [results, setResults] = useState<BulkOrderResult[]>([]);
  const [errors, setErrors] = useState<BulkParseError[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    setFileName(file.name);

    if (EXCEL_EXTENSION_RE.test(file.name)) {
      parseBulkOrdersXlsx(file).then(({ rows, errors: parseErrors }) => {
        const computed = computeBulkResults(rows);
        addLifetimeSavings(summarizeBulkResults(computed).savings);
        setResults(computed);
        setErrors(parseErrors);
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const { rows, errors: parseErrors } = parseBulkOrdersCsv(text);
      const computed = computeBulkResults(rows);
      addLifetimeSavings(summarizeBulkResults(computed).savings);
      setResults(computed);
      setErrors(parseErrors);
    };
    reader.readAsText(file);
  }, []);

  const summary = summarizeBulkResults(results);
  // Tweened, not snapped — each new batch's totals visibly count up from the
  // previous batch's (or from 0) rather than jumping straight to the figure.
  const animatedOrders = useCountUp(summary.totalOrders);
  const animatedAutoSplitTotal = useCountUp(summary.autoSplitTotal);
  const animatedSavings = useCountUp(summary.savings);

  const reset = () => {
    setFileName(null);
    setResults([]);
    setErrors([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-2.5">
      <Card
        size="sm"
        className="elevate animate-in fade-in fill-mode-both gap-3 rounded-md duration-300"
      >
        <CardHeader>
          <CardTitle className="text-sm">{t.bulkTitle}</CardTitle>
          <CardDescription className="text-xs">{t.bulkDesc}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2.5">
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              const file = event.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
            // Laid out as a horizontal band rather than a tall centred column:
            // the drop target only has to be recognisable, not dominate the
            // page, and this keeps the results visible without scrolling.
            className={cn(
              // Stacks below `sm` so the (longer) Bangla instruction isn't
              // squeezed against the button on a phone.
              "flex flex-col gap-2 rounded-md border-2 border-dashed px-3.5 py-3 transition-all duration-200 sm:flex-row sm:items-center sm:gap-3 sm:py-2.5",
              isDragging
                ? "border-primary bg-primary/8"
                : "border-muted-foreground/25 hover:border-primary/40 hover:bg-primary/4",
            )}
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full transition-transform duration-200",
                  isDragging ? "scale-110 bg-primary/15" : "bg-muted",
                )}
              >
                <Upload
                  className={cn(
                    "size-4 transition-colors",
                    isDragging ? "text-primary dark:text-ring" : "text-muted-foreground",
                  )}
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">{t.dropText}</p>
                {fileName && (
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <FileSpreadsheet className="size-3 shrink-0" />
                    <span className="truncate">{fileName}</span>
                  </p>
                )}
              </div>
            </div>
            <Button
              type="button"
              variant="default"
              size="sm"
              className="w-full shrink-0 sm:w-auto"
              onClick={() => fileInputRef.current?.click()}
            >
              {t.browseFiles}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
            <div className="flex flex-wrap items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5"
                onClick={() =>
                  downloadTextFile(
                    "bulk-orders-template.csv",
                    generateBulkTemplateCsv(),
                  )
                }
              >
                <Download className="size-3.5" /> {t.csvTemplate}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5"
                onClick={async () =>
                  downloadBlob(
                    "bulk-orders-template.xlsx",
                    await generateBulkTemplateXlsxBlob(),
                  )
                }
              >
                <Download className="size-3.5" /> {t.excelTemplate}
              </Button>
            </div>
            {(results.length > 0 || errors.length > 0) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground"
                onClick={reset}
              >
                <Trash2 className="size-3.5" /> {t.clear}
              </Button>
            )}
          </div>

          <p className="text-[0.6875rem] leading-relaxed text-muted-foreground">
            {t.columnsPrefix} <code>order_id</code>, <code>location</code> (Inside
            Dhaka / Suburbs / Outside Dhaka), <code>weight_kg</code>,{" "}
            <code>product_price</code>, <code>cod</code> (yes/no).
          </p>
        </CardContent>
      </Card>

      {errors.length > 0 && (
        <Card
          size="sm"
          className="elevate animate-in fade-in fill-mode-both rounded-md border-destructive/30 bg-destructive/4 duration-300"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5 text-sm text-destructive">
              <AlertTriangle className="size-4" /> {t.rowsSkipped(errors.length)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
              {errors.map((error, index) => (
                <li key={index}>
                  {error.rowNumber > 0 ? t.rowLabel(error.rowNumber) : ""}
                  {error.message}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <>
          {/* One divided strip rather than three floating tiles, with the
              savings cell inverted to green — the figure that matters carries
              the colour, and nothing else has to shout. */}
          <div className="elevate animate-in fade-in fill-mode-both grid grid-cols-1 divide-y divide-border overflow-hidden rounded-md border border-border bg-card duration-300 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="p-3">
              <div className="micro text-muted-foreground">{t.ordersProcessed}</div>
              <div className="numeric mt-1.5 text-2xl">{Math.round(animatedOrders)}</div>
            </div>
            <div className="p-3">
              <div className="micro text-muted-foreground">{t.autoSplitTotal}</div>
              <div className="numeric mt-1.5 text-2xl">
                {formatBDT(Math.round(animatedAutoSplitTotal))}
              </div>
            </div>
            <div className="bg-hero p-3 text-white">
              <div className="micro text-gold">
                {summary.bestSingleCourier &&
                  t.savingsVsAll(summary.bestSingleCourier.courier)}
              </div>
              <div className="numeric mt-1.5 text-2xl">
                {formatBDT(Math.round(animatedSavings))}
                {summary.savingsPct > 0 && (
                  <span className="ml-1 text-sm text-white/60">
                    ({summary.savingsPct.toFixed(0)}%)
                  </span>
                )}
              </div>
            </div>
          </div>

          <Card
            size="sm"
            className="elevate animate-in fade-in fill-mode-both gap-3 rounded-md duration-300"
          >
            <CardHeader>
              <CardTitle className="col-start-1 row-start-1 text-sm">
                {t.splitBreakdownTitle}
              </CardTitle>
              {/* Pinned explicitly: with the action moved out of column 2 on
                  mobile (below), auto-placement would flow the description up
                  beside the title instead of under it. */}
              <CardDescription className="col-start-1 row-start-2 text-xs">
                {t.splitBreakdownDesc}
              </CardDescription>
              {/* CardHeader's default action slot pins to a second grid
                  column, which crowds the wrapped Bangla title on a phone.
                  Below `sm` the buttons drop onto their own row instead. */}
              <CardAction className="col-start-1 row-start-3 mt-1 justify-self-start sm:col-start-2 sm:row-span-2 sm:row-start-1 sm:mt-0 sm:justify-self-end">
                <div className="flex flex-wrap items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() =>
                      downloadTextFile(
                        "auto-split-results.csv",
                        bulkResultsToCsv(results),
                      )
                    }
                  >
                    <Download className="size-3.5" /> {t.exportCsv}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={async () =>
                      downloadBlob(
                        "auto-split-results.xlsx",
                        await bulkResultsToXlsxBlob(results),
                      )
                    }
                  >
                    <Download className="size-3.5" /> {t.exportExcel}
                  </Button>
                </div>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {summary.perCourierTotals.map((entry) => (
                <Badge key={entry.courier} variant="outline" className="gap-1.5 py-1">
                  <Bike className={`size-3 ${COURIER_ICON_COLOR[entry.courier]}`} />
                  {t.courierSplitSummary(entry.courier, entry.orderCount, formatBDT(entry.total))}
                </Badge>
              ))}
            </CardContent>
          </Card>

          <Card
            size="sm"
            className="elevate animate-in fade-in fill-mode-both overflow-x-auto rounded-md duration-300"
          >
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.tableOrder}</TableHead>
                    <TableHead>{t.tableZone}</TableHead>
                    <TableHead>{t.tableWeight}</TableHead>
                    <TableHead>{t.tablePrice}</TableHead>
                    <TableHead>{t.tableCod}</TableHead>
                    <TableHead>{t.tableCourier}</TableHead>
                    <TableHead className="text-right">{t.tableCharge}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => (
                    <TableRow
                      key={result.rowNumber}
                      className="transition-colors hover:bg-secondary/70"
                    >
                      <TableCell className="font-medium">
                        {result.orderId}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {result.best.zoneLabel}
                      </TableCell>
                      <TableCell className="numeric text-muted-foreground">
                        {result.weightKg}kg
                      </TableCell>
                      <TableCell className="numeric text-muted-foreground">
                        {formatBDT(result.productPrice)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {result.isCOD ? t.codYes : t.codNo}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5">
                          <Bike className={`size-3 ${COURIER_ICON_COLOR[result.best.courier]}`} />
                          {result.best.courier}
                        </span>
                      </TableCell>
                      <TableCell className="numeric text-right font-medium">
                        {formatBDT(result.best.totalCharge)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {results.length === 0 && errors.length === 0 && (
        <Card className="elevate animate-in fade-in fill-mode-both rounded-md delay-100 duration-300">
          <CardContent className="py-7 text-center text-sm text-muted-foreground">
            {t.bulkEmptyState}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
