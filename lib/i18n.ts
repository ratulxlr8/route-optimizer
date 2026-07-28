/**
 * Static UI copy in English and Bangla. District names and the pricing
 * engine's own generated strings (zone labels, slab notes, parse errors)
 * stay in English regardless of language — they're real place names and
 * data pulled from lib/*Pricing.ts, not chrome copy.
 */

export type Lang = "en" | "bn";

export interface Dictionary {
  appName: string;
  tagline: string;
  tabSingle: string;
  tabBulk: string;
  orderDetailsTitle: string;
  orderDetailsDesc: string;
  pickupLabel: string;
  pickupHelp: string;
  deliveryLabel: string;
  deliveryHelp: string;
  weightLabel: string;
  priceLabel: string;
  codLabel: string;
  codHelp: string;
  emptyState: string;
  baseCharge: string;
  overage: string;
  codFee: string;
  total: string;
  cheapestBadge: string;
  cheapestLine: (courier: string, amount: string) => string;
  savingsLine: (courier: string, amount: string, pct: string) => string;
  bulkTitle: string;
  bulkDesc: string;
  dropText: string;
  browseFiles: string;
  csvTemplate: string;
  excelTemplate: string;
  clear: string;
  columnsPrefix: string;
  rowsSkipped: (n: number) => string;
  rowLabel: (n: number) => string;
  ordersProcessed: string;
  autoSplitTotal: string;
  savingsVsAll: (courier: string) => string;
  splitBreakdownTitle: string;
  splitBreakdownDesc: string;
  exportCsv: string;
  exportExcel: string;
  courierSplitSummary: (courier: string, orderCount: number, total: string) => string;
  tableOrder: string;
  tableZone: string;
  tableWeight: string;
  tablePrice: string;
  tableCod: string;
  tableCourier: string;
  tableCharge: string;
  codYes: string;
  codNo: string;
  bulkEmptyState: string;
}

export const dictionaries: Record<Lang, Dictionary> = {
  en: {
    appName: "Smart Courier Auto-Splitter",
    tagline: "Find the cheapest courier for every order",
    tabSingle: "Single Order",
    tabBulk: "Bulk Upload",
    orderDetailsTitle: "Order Details",
    orderDetailsDesc: "Enter the shipment once — every courier's rate updates instantly.",
    pickupLabel: "Pickup",
    pickupHelp: "Each courier translates this to its own district numbering.",
    deliveryLabel: "Delivery",
    deliveryHelp: "Each courier zones this route slightly differently, changing the tier.",
    weightLabel: "Parcel Weight (kg)",
    priceLabel: "Product Price (BDT)",
    codLabel: "Cash on Delivery",
    codHelp: "Adds each courier's COD collection fee.",
    emptyState: "Enter a parcel weight to compare courier rates.",
    baseCharge: "Base charge",
    overage: "Overage",
    codFee: "COD fee",
    total: "Total",
    cheapestBadge: "Cheapest",
    cheapestLine: (courier, amount) => `${courier} is cheapest for this order at ${amount}`,
    savingsLine: (courier, amount, pct) => ` — save ${amount} (${pct}%) vs ${courier}.`,
    bulkTitle: "Bulk Upload",
    bulkDesc:
      "Upload a CSV or Excel file of today's orders — every row gets auto-split to whichever courier is cheapest.",
    dropText: "Drop a CSV or Excel file here, or",
    browseFiles: "Browse files",
    csvTemplate: "CSV template",
    excelTemplate: "Excel template",
    clear: "Clear",
    columnsPrefix: "Columns:",
    rowsSkipped: (n) => `${n} row${n === 1 ? "" : "s"} skipped`,
    rowLabel: (n) => `Row ${n}: `,
    ordersProcessed: "Orders processed",
    autoSplitTotal: "Auto-split total",
    savingsVsAll: (courier) => `Savings vs. all on ${courier}`,
    splitBreakdownTitle: "Split breakdown",
    splitBreakdownDesc:
      "How many orders each courier wins, and what it would cost if every order went there instead.",
    exportCsv: "Export CSV",
    exportExcel: "Export Excel",
    courierSplitSummary: (courier, orderCount, total) =>
      `${courier}: ${orderCount} order${orderCount === 1 ? "" : "s"} · ${total} if all here`,
    tableOrder: "Order",
    tableZone: "Zone",
    tableWeight: "Weight",
    tablePrice: "Price",
    tableCod: "COD",
    tableCourier: "Courier",
    tableCharge: "Charge",
    codYes: "Yes",
    codNo: "No",
    bulkEmptyState: "Upload a CSV or Excel file to see the auto-split plan for every order.",
  },
  bn: {
    appName: "স্মার্ট কুরিয়ার অটো-স্প্লিটার",
    tagline: "প্রতিটি অর্ডারের জন্য সবচেয়ে সাশ্রয়ী কুরিয়ার খুঁজে নিন",
    tabSingle: "একক অর্ডার",
    tabBulk: "বাল্ক আপলোড",
    orderDetailsTitle: "অর্ডারের বিবরণ",
    orderDetailsDesc: "একবার শিপমেন্টের তথ্য দিন — প্রতিটি কুরিয়ারের রেট সাথে সাথে আপডেট হবে।",
    pickupLabel: "পিকআপ",
    pickupHelp: "প্রতিটি কুরিয়ার এটি নিজস্ব জেলা নম্বরে রূপান্তর করে নেয়।",
    deliveryLabel: "ডেলিভারি",
    deliveryHelp: "প্রতিটি কুরিয়ার এই রুটের জোন আলাদাভাবে ঠিক করে, যা রেট বদলে দিতে পারে।",
    weightLabel: "পার্সেলের ওজন (কেজি)",
    priceLabel: "পণ্যের মূল্য (টাকা)",
    codLabel: "ক্যাশ অন ডেলিভারি",
    codHelp: "প্রতিটি কুরিয়ারের সিওডি কালেকশন ফি যোগ হবে।",
    emptyState: "কুরিয়ার রেট তুলনা করতে পার্সেলের ওজন লিখুন।",
    baseCharge: "বেস চার্জ",
    overage: "অতিরিক্ত চার্জ",
    codFee: "সিওডি ফি",
    total: "সর্বমোট",
    cheapestBadge: "সবচেয়ে সাশ্রয়ী",
    cheapestLine: (courier, amount) => `এই অর্ডারের জন্য সবচেয়ে সাশ্রয়ী ${courier}, খরচ ${amount}`,
    savingsLine: (courier, amount, pct) => ` — ${courier}-এর তুলনায় ${amount} (${pct}%) সাশ্রয়।`,
    bulkTitle: "বাল্ক আপলোড",
    bulkDesc:
      "আজকের অর্ডারের CSV বা Excel ফাইল আপলোড করুন — প্রতিটি সারি স্বয়ংক্রিয়ভাবে সবচেয়ে সাশ্রয়ী কুরিয়ারে ভাগ হয়ে যাবে।",
    dropText: "এখানে CSV বা Excel ফাইল টেনে আনুন, অথবা",
    browseFiles: "ফাইল বেছে নিন",
    csvTemplate: "CSV টেমপ্লেট",
    excelTemplate: "Excel টেমপ্লেট",
    clear: "মুছে ফেলুন",
    columnsPrefix: "কলাম:",
    rowsSkipped: (n) => `${n}টি সারি বাদ দেওয়া হয়েছে`,
    rowLabel: (n) => `সারি ${n}: `,
    ordersProcessed: "প্রসেসকৃত অর্ডার",
    autoSplitTotal: "অটো-স্প্লিট মোট",
    savingsVsAll: (courier) => `সব অর্ডার ${courier}-এ পাঠালে যত সাশ্রয় হতো, তার তুলনায়`,
    splitBreakdownTitle: "কুরিয়ার অনুযায়ী বণ্টন",
    splitBreakdownDesc: "প্রতিটি কুরিয়ার কতগুলো অর্ডার পেয়েছে, আর সব অর্ডার সেখানে পাঠালে খরচ কত হতো।",
    exportCsv: "CSV এক্সপোর্ট",
    exportExcel: "Excel এক্সপোর্ট",
    courierSplitSummary: (courier, orderCount, total) =>
      `${courier}: ${orderCount}টি অর্ডার · সব এখানে পাঠালে ${total}`,
    tableOrder: "অর্ডার",
    tableZone: "জোন",
    tableWeight: "ওজন",
    tablePrice: "মূল্য",
    tableCod: "সিওডি",
    tableCourier: "কুরিয়ার",
    tableCharge: "চার্জ",
    codYes: "হ্যাঁ",
    codNo: "না",
    bulkEmptyState: "প্রতিটি অর্ডারের অটো-স্প্লিট পরিকল্পনা দেখতে একটি CSV বা Excel ফাইল আপলোড করুন।",
  },
};
