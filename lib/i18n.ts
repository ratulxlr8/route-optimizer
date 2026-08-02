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
  routeSection: string;
  parcelSection: string;
  pickupLabel: string;
  deliveryLabel: string;
  searchDistrict: string;
  noDistrictFound: string;
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
  bestPick: string;
  youSave: string;
  vsCourier: (courier: string) => string;
  allCouriers: string;
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
  tourHelpLabel: string;
  tourWelcomeTitle: string;
  tourWelcomeDesc: string;
  tourRouteTitle: string;
  tourRouteDesc: string;
  tourParcelTitle: string;
  tourParcelDesc: string;
  tourCodTitle: string;
  tourCodDesc: string;
  tourBestPickTitle: string;
  tourBestPickDesc: string;
  tourAllCouriersTitle: string;
  tourAllCouriersDesc: string;
  tourBulkTitle: string;
  tourBulkDesc: string;
  tourNext: string;
  tourBack: string;
  tourSkip: string;
  tourStart: string;
  tourFinish: string;
  tourStepOf: (step: number, total: number) => string;
  seoTitle: string;
  seoIntro: string;
  seoHowTitle: string;
  seoStep1: string;
  seoStep2: string;
  seoStep3: string;
  seoLinksTitle: string;
  seoLinksIntro: string;
  saveRouteLabel: string;
  removeRouteLabel: string;
  lifetimeSavings: (amount: string) => string;
}

export const dictionaries: Record<Lang, Dictionary> = {
  en: {
    appName: "FleetSplit",
    tagline: "Find the cheapest courier for every order",
    tabSingle: "Single Order",
    tabBulk: "Bulk Upload",
    orderDetailsTitle: "Order Details",
    orderDetailsDesc: "Enter the shipment once — every courier's rate updates instantly.",
    routeSection: "Route",
    parcelSection: "Parcel",
    pickupLabel: "Pickup",
    deliveryLabel: "Delivery",
    searchDistrict: "Search district…",
    noDistrictFound: "No district found.",
    weightLabel: "Weight (kg)",
    priceLabel: "Price (BDT)",
    codLabel: "Cash on Delivery",
    codHelp: "Adds each courier's COD collection fee.",
    emptyState: "Enter a parcel weight to compare courier rates.",
    baseCharge: "Base charge",
    overage: "Overage",
    codFee: "COD fee",
    total: "Total",
    cheapestBadge: "Cheapest",
    bestPick: "Best pick",
    youSave: "You save",
    vsCourier: (courier) => `vs ${courier}`,
    allCouriers: "All couriers",
    bulkTitle: "Bulk Upload",
    bulkDesc:
      "Upload a CSV or Excel file of today's orders — every row gets auto-split to whichever courier is cheapest.",
    dropText: "Drop a CSV or Excel file here",
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
    tourHelpLabel: "How it works",
    tourWelcomeTitle: "Welcome to FleetSplit",
    tourWelcomeDesc:
      "A 30-second tour of how to compare courier rates and auto-split bulk orders. Ready?",
    tourRouteTitle: "Set your route",
    tourRouteDesc: "Choose the pickup and delivery district — rates depend on both.",
    tourParcelTitle: "Add parcel details",
    tourParcelDesc:
      "Enter the weight and product price. Every courier's rate updates instantly as you type.",
    tourCodTitle: "Cash on Delivery",
    tourCodDesc:
      "Turn this on if the order is COD — each courier charges a different collection fee.",
    tourBestPickTitle: "Your cheapest option",
    tourBestPickDesc:
      "FleetSplit always surfaces the cheapest courier for this exact route and weight, plus how much you save.",
    tourAllCouriersTitle: "Compare every courier",
    tourAllCouriersDesc:
      "See all rates ranked side-by-side, cheapest first — hover a row for the full fee breakdown.",
    tourBulkTitle: "Got a whole day's orders?",
    tourBulkDesc:
      "Switch to Bulk Upload to auto-split a CSV or Excel file of orders across couriers in one go.",
    tourNext: "Next",
    tourBack: "Back",
    tourSkip: "Skip tour",
    tourStart: "Start tour",
    tourFinish: "Got it",
    tourStepOf: (step, total) => `${step} of ${total}`,
    seoTitle: "The fastest way to compare courier rates in Bangladesh",
    seoIntro:
      "FleetSplit compares Pathao, RedX, CarryBee, and Steadfast delivery charges for any pickup-to-delivery route in Bangladesh, using rates reverse-engineered from each courier's own live calculator — not estimates. Enter a route, weight, and price above to see every courier's total charge ranked side by side, including COD fees, instantly and for free.",
    seoHowTitle: "How the comparison works",
    seoStep1: "Choose a pickup and delivery district from all 64 districts of Bangladesh.",
    seoStep2: "Enter the parcel's weight and price, and turn on Cash on Delivery if it applies.",
    seoStep3:
      "FleetSplit ranks Pathao, RedX, CarryBee, and Steadfast by total charge — cheapest first.",
    seoLinksTitle: "Courier rate details",
    seoLinksIntro: "See the full rate table and zone logic for each courier:",
    saveRouteLabel: "Save this route",
    removeRouteLabel: "Remove saved route",
    lifetimeSavings: (amount) => `Saved ${amount} so far`,
  },
  bn: {
    appName: "FleetSplit",
    tagline: "প্রতিটি অর্ডারের জন্য সবচেয়ে সাশ্রয়ী কুরিয়ার খুঁজে নিন",
    tabSingle: "একক অর্ডার",
    tabBulk: "বাল্ক আপলোড",
    orderDetailsTitle: "অর্ডারের বিবরণ",
    orderDetailsDesc: "একবার শিপমেন্টের তথ্য দিন — প্রতিটি কুরিয়ারের রেট সাথে সাথে আপডেট হবে।",
    routeSection: "রুট",
    parcelSection: "পার্সেল",
    pickupLabel: "পিকআপ",
    deliveryLabel: "ডেলিভারি",
    searchDistrict: "জেলা খুঁজুন…",
    noDistrictFound: "কোনো জেলা পাওয়া যায়নি।",
    weightLabel: "ওজন (কেজি)",
    priceLabel: "মূল্য (টাকা)",
    codLabel: "ক্যাশ অন ডেলিভারি",
    codHelp: "প্রতিটি কুরিয়ারের সিওডি কালেকশন ফি যোগ হবে।",
    emptyState: "কুরিয়ার রেট তুলনা করতে পার্সেলের ওজন লিখুন।",
    baseCharge: "বেস চার্জ",
    overage: "অতিরিক্ত চার্জ",
    codFee: "সিওডি ফি",
    total: "সর্বমোট",
    cheapestBadge: "সবচেয়ে সাশ্রয়ী",
    bestPick: "সেরা পছন্দ",
    youSave: "আপনার সাশ্রয়",
    vsCourier: (courier) => `${courier}-এর তুলনায়`,
    allCouriers: "সব কুরিয়ার",
    bulkTitle: "বাল্ক আপলোড",
    bulkDesc:
      "আজকের অর্ডারের CSV বা Excel ফাইল আপলোড করুন — প্রতিটি সারি স্বয়ংক্রিয়ভাবে সবচেয়ে সাশ্রয়ী কুরিয়ারে ভাগ হয়ে যাবে।",
    dropText: "এখানে CSV বা Excel ফাইল টেনে আনুন",
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
    tourHelpLabel: "কীভাবে কাজ করে",
    tourWelcomeTitle: "FleetSplit-এ স্বাগতম",
    tourWelcomeDesc:
      "কুরিয়ার রেট তুলনা আর বাল্ক অর্ডার অটো-স্প্লিট করার ৩০ সেকেন্ডের একটি গাইড। শুরু করবেন?",
    tourRouteTitle: "আপনার রুট নির্বাচন করুন",
    tourRouteDesc: "পিকআপ ও ডেলিভারি জেলা বেছে নিন — রেট দুটোর উপরই নির্ভর করে।",
    tourParcelTitle: "পার্সেলের তথ্য দিন",
    tourParcelDesc:
      "ওজন ও পণ্যের মূল্য লিখুন। টাইপ করার সাথে সাথেই প্রতিটি কুরিয়ারের রেট আপডেট হবে।",
    tourCodTitle: "ক্যাশ অন ডেলিভারি",
    tourCodDesc: "অর্ডারটি COD হলে এটি চালু করুন — প্রতিটি কুরিয়ারের কালেকশন ফি ভিন্ন।",
    tourBestPickTitle: "সবচেয়ে সাশ্রয়ী অপশন",
    tourBestPickDesc:
      "এই রুট ও ওজনের জন্য সবচেয়ে সাশ্রয়ী কুরিয়ার এবং কত সাশ্রয় হচ্ছে তা FleetSplit সবসময় সামনে দেখায়।",
    tourAllCouriersTitle: "সব কুরিয়ার তুলনা করুন",
    tourAllCouriersDesc:
      "সবচেয়ে সাশ্রয়ী থেকে শুরু করে সব রেট পাশাপাশি দেখুন — হোভার করলে পুরো ফি ভাঙন দেখা যাবে।",
    tourBulkTitle: "একদিনের সব অর্ডার একসাথে?",
    tourBulkDesc:
      "CSV বা Excel ফাইল আপলোড করে একসাথে সব অর্ডার কুরিয়ারে অটো-স্প্লিট করতে বাল্ক আপলোডে যান।",
    tourNext: "পরবর্তী",
    tourBack: "পেছনে",
    tourSkip: "টুর বাদ দিন",
    tourStart: "টুর শুরু করুন",
    tourFinish: "বুঝেছি",
    tourStepOf: (step, total) => `${total}-এর মধ্যে ${step}`,
    seoTitle: "বাংলাদেশে কুরিয়ার রেট তুলনা করার সবচেয়ে দ্রুত উপায়",
    seoIntro:
      "FleetSplit বাংলাদেশের যেকোনো পিকআপ-থেকে-ডেলিভারি রুটের জন্য Pathao, RedX, CarryBee এবং Steadfast-এর ডেলিভারি চার্জ তুলনা করে — প্রতিটি কুরিয়ারের নিজস্ব লাইভ ক্যালকুলেটর থেকে রিভার্স-ইঞ্জিনিয়ার করা রেট ব্যবহার করে, অনুমান নয়। উপরে একটি রুট, ওজন ও মূল্য দিন — সাথে সাথেই COD ফিসহ প্রতিটি কুরিয়ারের সর্বমোট চার্জ সাশ্রয়ী থেকে ব্যয়বহুল ক্রমে দেখতে পাবেন, সম্পূর্ণ বিনামূল্যে।",
    seoHowTitle: "যেভাবে তুলনা করা হয়",
    seoStep1: "বাংলাদেশের ৬৪টি জেলার মধ্য থেকে পিকআপ ও ডেলিভারি জেলা বেছে নিন।",
    seoStep2: "পার্সেলের ওজন ও মূল্য লিখুন, এবং COD অর্ডার হলে ক্যাশ অন ডেলিভারি চালু করুন।",
    seoStep3:
      "FleetSplit সর্বমোট চার্জ অনুযায়ী Pathao, RedX, CarryBee এবং Steadfast-কে র‍্যাঙ্ক করে — সবচেয়ে সাশ্রয়ীটি সবার আগে।",
    seoLinksTitle: "কুরিয়ারভিত্তিক রেট বিস্তারিত",
    seoLinksIntro: "প্রতিটি কুরিয়ারের সম্পূর্ণ রেট টেবিল ও জোন লজিক দেখুন:",
    saveRouteLabel: "এই রুট সংরক্ষণ করুন",
    removeRouteLabel: "সংরক্ষিত রুট মুছুন",
    lifetimeSavings: (amount) => `এ পর্যন্ত সাশ্রয় ${amount}`,
  },
};
