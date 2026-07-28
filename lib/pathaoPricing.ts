/**
 * Pathao's real delivery-fee engine — reverse-engineered from their price
 * calculator's network calls, not from documentation. Pathao doesn't price
 * by distance: it resolves a zone from a metro group (Dhaka, Narayanganj,
 * Gazipur), then looks up a flat base fare by weight bucket plus a per-kg
 * surcharge above 2kg.
 *
 * This supersedes the placeholder PATHAO_RATES that used to live in
 * courierCalculators.ts (one exact anchor + three estimated zones). Pathao
 * has its own district numbering too — a third, unrelated scheme from
 * CarryBee's and Steadfast's (see the note in lib/districts.ts) — translated
 * via `resolvePathaoDistrictId`.
 *
 * Static snapshot, not a live integration — same reasoning as the other
 * courier engines. Re-probe and update this file if Pathao revises rates.
 */

export type PathaoItemType = "PARCEL" | "DOCUMENT";
export type PathaoDeliveryType = "NORMAL" | "SAME_DAY";
export type PathaoZone = "SAME_CITY" | "SUBURB" | "INTER_CITY" | "OUTSIDE_CITY";

export const PATHAO_DHAKA = 1;
export const PATHAO_NARAYANGANJ = 21;
export const PATHAO_GAZIPUR = 22;

/** Dhaka metro group — the only place "suburb" pricing applies. */
const METRO = new Set([PATHAO_DHAKA, PATHAO_NARAYANGANJ, PATHAO_GAZIPUR]);

/**
 * both cities the same → same city; both in the metro group → suburb;
 * exactly one in the metro group → inter city; neither → outside city (an
 * undocumented tier — e.g. Cumilla→Feni and Khulna→Rajshahi both cost more
 * than Dhaka→Cox's Bazar).
 */
export function resolvePathaoZone(fromCityId: number, toCityId: number): PathaoZone {
  if (fromCityId === toCityId) return "SAME_CITY";
  const fromMetro = METRO.has(fromCityId);
  const toMetro = METRO.has(toCityId);
  if (fromMetro && toMetro) return "SUBURB";
  if (fromMetro || toMetro) return "INTER_CITY";
  return "OUTSIDE_CITY";
}

// Weight buckets exactly as Pathao's own dropdown offers them. Billable
// weight is the bucket's upper bound; the API rejects anything under 0.5kg.
export const PATHAO_WEIGHT_BUCKETS = [
  0.2, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15,
] as const;
const MIN_BILLABLE_KG = 0.5;
const MAX_BILLABLE_KG = 15;

function toBillableWeight(kg: number): number {
  const bucket = PATHAO_WEIGHT_BUCKETS.find((b) => kg <= b) ?? MAX_BILLABLE_KG;
  return Math.max(bucket, MIN_BILLABLE_KG);
}

interface PathaoTier {
  /** Flat fares for the ≤0.5, ≤midKg, ≤2 kg tiers (see midKg below). */
  base: [number, number, number];
  extraPerKg: number;
  /** kg boundary between the 2nd and 3rd base tier — 1kg for Normal delivery,
   *  1.5kg for Same Day (its real boundary is different from Normal's). */
  midKg?: number;
}

const NORMAL_PARCEL: Record<PathaoZone, PathaoTier> = {
  SAME_CITY: { base: [60, 70, 90], extraPerKg: 15 },
  SUBURB: { base: [80, 100, 130], extraPerKg: 25 },
  INTER_CITY: { base: [110, 130, 170], extraPerKg: 25 },
  OUTSIDE_CITY: { base: [120, 145, 180], extraPerKg: 25 },
};

const NORMAL_DOCUMENT: Record<PathaoZone, PathaoTier> = {
  SAME_CITY: { base: [25, 45, 55], extraPerKg: 15 },
  SUBURB: { base: [45, 55, 65], extraPerKg: 25 },
  INTER_CITY: { base: [45, 55, 65], extraPerKg: 25 },
  OUTSIDE_CITY: { base: [45, 55, 65], extraPerKg: 25 },
};

// Flat 120 up to 1.5kg (parcel), then 150 at 2kg, +15/kg after.
const SAME_DAY: Record<PathaoItemType, PathaoTier> = {
  PARCEL: { base: [120, 120, 150], extraPerKg: 15, midKg: 1.5 },
  DOCUMENT: { base: [100, 100, 100], extraPerKg: 15, midKg: 1.5 },
};

// Quirk: Gazipur <-> Narayanganj documents bill on a distinct curve — not
// the same-city rate (they're different cities) nor the plain suburb rate.
function isMetroPairWithoutDhaka(fromCityId: number, toCityId: number): boolean {
  return (
    fromCityId !== toCityId &&
    METRO.has(fromCityId) &&
    METRO.has(toCityId) &&
    fromCityId !== PATHAO_DHAKA &&
    toCityId !== PATHAO_DHAKA
  );
}

function pickTier(
  zone: PathaoZone,
  itemType: PathaoItemType,
  deliveryType: PathaoDeliveryType,
  fromCityId: number,
  toCityId: number,
): PathaoTier {
  if (deliveryType === "SAME_DAY") return SAME_DAY[itemType];
  if (itemType === "DOCUMENT") {
    if (isMetroPairWithoutDhaka(fromCityId, toCityId)) {
      return { base: [45, 45, 55], extraPerKg: 15 };
    }
    return NORMAL_DOCUMENT[zone];
  }
  return NORMAL_PARCEL[zone];
}

function baseFor(tier: PathaoTier, kg: number): number {
  if (kg <= 0.5) return tier.base[0];
  if (kg <= (tier.midKg ?? 1)) return tier.base[1];
  return tier.base[2];
}

export interface PathaoInput {
  fromCityId: number;
  toCityId: number;
  weightKg: number;
  itemType?: PathaoItemType;
  deliveryType?: PathaoDeliveryType;
}

export interface PathaoChargeResult {
  base: number;
  overage: number;
  billableWeightKg: number;
  zone: PathaoZone;
  slabNote: string;
  warning?: string;
}

export function computePathaoCharge(input: PathaoInput): PathaoChargeResult {
  const itemType = input.itemType ?? "PARCEL";
  const deliveryType = input.deliveryType ?? "NORMAL";
  const zone = resolvePathaoZone(input.fromCityId, input.toCityId);

  if (deliveryType === "SAME_DAY" && zone !== "SAME_CITY") {
    return {
      base: 0,
      overage: 0,
      billableWeightKg: 0,
      zone,
      slabNote: "Same Day unavailable for this route",
      warning: "Same Day Delivery is available within the same city only.",
    };
  }

  if (input.weightKg > MAX_BILLABLE_KG) {
    return {
      base: 0,
      overage: 0,
      billableWeightKg: MAX_BILLABLE_KG,
      zone,
      slabNote: `Maximum weight is ${MAX_BILLABLE_KG}kg`,
      warning: `Maximum weight is ${MAX_BILLABLE_KG}kg`,
    };
  }

  const kg = toBillableWeight(input.weightKg);
  const tier = pickTier(zone, itemType, deliveryType, input.fromCityId, input.toCityId);
  const base = baseFor(tier, kg);
  const overage = Math.max(0, Math.ceil(kg) - 2) * tier.extraPerKg;

  return {
    base,
    overage,
    billableWeightKg: kg,
    zone,
    slabNote:
      overage > 0
        ? `${base} base + ${Math.ceil(kg) - 2}kg over 2kg @ ${tier.extraPerKg}/kg`
        : `${kg}kg fits the up-to-${kg}kg tier`,
  };
}

// Pathao's own district ids — a third numbering scheme, unrelated to
// CarryBee's (this app's canonical list) or Steadfast's own.
export const PATHAO_DISTRICTS: { id: number; name: string }[] = [
  { id: 1, name: "Dhaka" },
  { id: 2, name: "Chittagong" },
  { id: 3, name: "Sylhet" },
  { id: 4, name: "Rajshahi" },
  { id: 5, name: "Cumilla" },
  { id: 6, name: "Feni" },
  { id: 7, name: "Noakhali" },
  { id: 8, name: "Chandpur" },
  { id: 9, name: "Bogra" },
  { id: 10, name: "Sirajganj" },
  { id: 11, name: "Cox's Bazar" },
  { id: 12, name: "Moulvibazar" },
  { id: 13, name: "Tangail" },
  { id: 14, name: "Natore" },
  { id: 15, name: "Chapainawabganj" },
  { id: 16, name: "Manikganj" },
  { id: 17, name: "Barisal" },
  { id: 18, name: "Faridpur" },
  { id: 19, name: "Jashore" },
  { id: 20, name: "Khulna" },
  { id: PATHAO_NARAYANGANJ, name: "Narayanganj" },
  { id: PATHAO_GAZIPUR, name: "Gazipur" },
  { id: 23, name: "Munsiganj" },
  { id: 24, name: "Pabna" },
  { id: 25, name: "Rangpur" },
  { id: 26, name: "Mymensingh" },
  { id: 27, name: "Jhalokathi" },
  { id: 28, name: "Kushtia" },
  { id: 29, name: "Patuakhali" },
  { id: 30, name: "Habiganj" },
  { id: 31, name: "Pirojpur" },
  { id: 32, name: "B. Baria" },
  { id: 33, name: "Sherpur" },
  { id: 34, name: "Barguna" },
  { id: 35, name: "Dinajpur" },
  { id: 36, name: "Thakurgaon" },
  { id: 37, name: "Panchagarh" },
  { id: 38, name: "Gaibandha" },
  { id: 39, name: "Nilphamari" },
  { id: 40, name: "Lakshmipur" },
  { id: 41, name: "Jamalpur" },
  { id: 42, name: "Kishoreganj" },
  { id: 43, name: "Madaripur" },
  { id: 44, name: "Netrakona" },
  { id: 45, name: "Sunamganj" },
  { id: 46, name: "Naogaon" },
  { id: 47, name: "Narshingdi" },
  { id: 48, name: "Joypurhat" },
  { id: 49, name: "Jhenidah" },
  { id: 50, name: "Meherpur" },
  { id: 51, name: "Satkhira" },
  { id: 52, name: "Bagerhat" },
  { id: 53, name: "Bhola" },
  { id: 54, name: "Narail" },
  { id: 55, name: "Kurigram" },
  { id: 56, name: "Gopalgonj" },
  { id: 57, name: "Lalmonirhat" },
  { id: 58, name: "Rajbari" },
  { id: 59, name: "Rangamati" },
  { id: 60, name: "Magura" },
  { id: 61, name: "Chuadanga" },
  { id: 62, name: "Bandarban" },
  { id: 63, name: "Khagrachari" },
  { id: 64, name: "Shariatpur" },
];

function normalizeDistrictName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// This app's canonical district list (lib/districts.ts) spells ~10 of these
// districts differently than Pathao's own payload does.
const CANONICAL_NAME_ALIASES: Record<string, string> = {
  chattogram: "chittagong",
  bogura: "bogra",
  brahmanbaria: "bbaria",
  munshiganj: "munsiganj",
  jhalokati: "jhalokathi",
  netrokona: "netrakona",
  narsingdi: "narshingdi",
  jhenaidah: "jhenidah",
  gopalganj: "gopalgonj",
  khagrachhari: "khagrachari",
};

const PATHAO_ID_BY_NORMALIZED_NAME = new Map(
  PATHAO_DISTRICTS.map((district) => [normalizeDistrictName(district.name), district.id]),
);

/**
 * Translates a district name from this app's canonical list into Pathao's
 * own internal district id. Returns undefined only if the name matches
 * neither list at all.
 */
export function resolvePathaoDistrictId(canonicalName: string): number | undefined {
  const normalized = normalizeDistrictName(canonicalName);
  const aliased = CANONICAL_NAME_ALIASES[normalized] ?? normalized;
  return PATHAO_ID_BY_NORMALIZED_NAME.get(aliased);
}

/** 1% COD fee, per Pathao's own calculator. */
export function pathaoCodCharge(codAmount: number): number {
  return Math.round(codAmount * 0.01);
}
