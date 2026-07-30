/**
 * FleetSplit — pricing engine.
 *
 * All four couriers now price a real pickup/delivery district pair,
 * reverse-engineered from each courier's own live calculator (see
 * lib/pathaoPricing.ts, lib/redxPricing.ts, lib/carrybeePricing.ts,
 * lib/steadfastPricing.ts for provenance and known caveats/approximations).
 * Each courier uses its own, unrelated district numbering — this app's
 * canonical list (lib/districts.ts) is translated into each courier's ids
 * via a per-courier resolver. COD fees are real for Pathao, RedX, and
 * Steadfast; CarryBee's is still an estimate (its live endpoint doesn't
 * return one).
 */

import {
  CARRYBEE_DHAKA_CITY_ID,
  calculateCarryBeeFee,
} from "@/lib/carrybeePricing";
import { DHAKA_SUBURB_PSEUDO_ID, getDistrictName } from "@/lib/districts";
import {
  PATHAO_DHAKA,
  PATHAO_GAZIPUR,
  type PathaoZone,
  computePathaoCharge,
  pathaoCodCharge,
  resolvePathaoDistrictId,
} from "@/lib/pathaoPricing";
import {
  REDX_ZONE,
  type RedxRouteClass,
  calculateRedxCharges,
} from "@/lib/redxPricing";
import {
  STEADFAST_DHAKA_CITY,
  STEADFAST_DHAKA_SUBURBAN,
  computeSteadfastCharge,
  resolveSteadfastDistrictId,
  steadfastCodCharge,
} from "@/lib/steadfastPricing";

// Only used for bulk CSV rows now, which carry a generic zone (not a real
// district) — see REPRESENTATIVE_DISTRICT_FOR_GENERIC below, which converts
// one into a stand-in real district for calculation purposes.
export type GenericLocation = "INSIDE_DHAKA" | "SUBURBS" | "OUTSIDE_DHAKA";

export interface CalculatorInput {
  /** Generic delivery zone — only meaningful for bulk CSV rows (see above);
   *  no courier reads this directly for single-order pricing anymore. */
  location: GenericLocation;
  weightKg: number;
  productPrice: number;
  isCOD: boolean;
  /** Real district id (see lib/districts.ts) the parcel ships from. */
  pickupDistrictId: number;
  /** Real district id the parcel ships to. */
  deliveryDistrictId: number;
}

export type CourierName = "Pathao" | "RedX" | "CarryBee" | "Steadfast";

export const COURIER_DOT: Record<CourierName, string> = {
  Pathao: "bg-red-500",
  RedX: "bg-orange-500",
  CarryBee: "bg-amber-500",
  Steadfast: "bg-blue-500",
};

/** Per-courier fill for the price-comparison bars — same brand hues as
 *  COURIER_DOT, softened so a full-width bar doesn't overpower the row. */
export const COURIER_BAR: Record<CourierName, string> = {
  Pathao: "bg-red-500/55",
  RedX: "bg-orange-500/55",
  CarryBee: "bg-amber-500/55",
  Steadfast: "bg-blue-500/55",
};

export interface CourierResult {
  courier: CourierName;
  zoneLabel: string;
  baseCharge: number;
  overageCharge: number;
  codCharge: number;
  totalCharge: number;
  slabNote: string;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

// ---------------------------------------------------------------------------
// Pathao
// ---------------------------------------------------------------------------

// Reverse-engineered from Pathao's live price calculator (not an estimate —
// see lib/pathaoPricing.ts for provenance/caveats). Like CarryBee, Steadfast,
// and RedX, Pathao prices a real district pair — its own district numbering,
// translated from this app's canonical id via name (the synthetic Dhaka
// Sub-Urban pick has no real Pathao district, so it's substituted with a
// real representative, Gazipur, which is one of Pathao's own metro cities).
function pathaoDistrictIdFor(canonicalId: number): number {
  if (canonicalId === DHAKA_SUBURB_PSEUDO_ID) return PATHAO_GAZIPUR;
  return resolvePathaoDistrictId(getDistrictName(canonicalId)) ?? PATHAO_DHAKA;
}

function pathaoZoneLabel(zone: PathaoZone, canonicalPickupId: number, canonicalDeliveryId: number): string {
  if (zone === "SAME_CITY") {
    return canonicalPickupId === CANONICAL_DISTRICT.DHAKA
      ? "Same City Dhaka"
      : `Same City ${getDistrictName(canonicalPickupId)}`;
  }
  if (zone === "SUBURB") return `${getDistrictName(canonicalPickupId)} to ${getDistrictName(canonicalDeliveryId)} (Metro)`;
  if (zone === "INTER_CITY") return `${getDistrictName(canonicalPickupId)} to ${getDistrictName(canonicalDeliveryId)}`;
  return `${getDistrictName(canonicalPickupId)} to ${getDistrictName(canonicalDeliveryId)} (Outside)`;
}

export function calculatePathao(input: CalculatorInput): CourierResult {
  const { base, overage, zone, slabNote } = computePathaoCharge({
    fromCityId: pathaoDistrictIdFor(input.pickupDistrictId),
    toCityId: pathaoDistrictIdFor(input.deliveryDistrictId),
    weightKg: input.weightKg,
  });
  const codCharge = input.isCOD ? pathaoCodCharge(input.productPrice) : 0;

  return {
    courier: "Pathao",
    zoneLabel: pathaoZoneLabel(zone, input.pickupDistrictId, input.deliveryDistrictId),
    baseCharge: base,
    overageCharge: overage,
    codCharge,
    totalCharge: round(base + overage + codCharge),
    slabNote,
  };
}

// ---------------------------------------------------------------------------
// RedX
// ---------------------------------------------------------------------------

// Reverse-engineered from RedX's live charge-calculator API (not an estimate
// — see lib/redxPricing.ts for provenance and the area-vs-district
// approximation it makes). Real district-pair pricing, like CarryBee and
// Steadfast: zoneId is derived from the existing generic-zone bucketing
// (there's no real RedX area-tree data to key off), and districtId is just
// the canonical id itself, which is enough for the same-district check.
function redxZoneId(canonicalDistrictId: number): number {
  const location = genericLocationFromDistrict(canonicalDistrictId);
  if (location === "INSIDE_DHAKA") return REDX_ZONE.INSIDE_DHAKA;
  if (location === "SUBURBS") return REDX_ZONE.DHAKA_SUBURB;
  return REDX_ZONE.OUTSIDE_DHAKA;
}

// INSIDE_CITY is only ever reached here when pickup and delivery are the same
// canonical district (in this app's approximation, exactly one canonical id
// maps to zone 1, so "both zone 1" implies "same district" too) — including
// the real quirk where two same-district areas outside Dhaka still get this
// rate, so the label names the actual district rather than always "Dhaka".
function redxZoneLabel(routeClass: RedxRouteClass, canonicalPickupId: number): string {
  if (routeClass === "INSIDE_CITY") {
    return canonicalPickupId === CANONICAL_DISTRICT.DHAKA
      ? "Inside Dhaka"
      : `Same City ${getDistrictName(canonicalPickupId)}`;
  }
  return routeClass === "SUBURB" ? "Dhaka Suburb" : "Outside Dhaka";
}

export function calculateRedX(input: CalculatorInput): CourierResult {
  const pickup = { zoneId: redxZoneId(input.pickupDistrictId), districtId: input.pickupDistrictId };
  const delivery = { zoneId: redxZoneId(input.deliveryDistrictId), districtId: input.deliveryDistrictId };
  const { routeClass, base, overage, codCharge: realCodCharge, slabNote } = calculateRedxCharges({
    pickup,
    delivery,
    weightKg: input.weightKg,
    price: input.productPrice,
  });
  const codCharge = input.isCOD ? realCodCharge : 0;

  return {
    courier: "RedX",
    zoneLabel: redxZoneLabel(routeClass, input.pickupDistrictId),
    baseCharge: base,
    overageCharge: overage,
    codCharge,
    totalCharge: round(base + overage + codCharge),
    slabNote,
  };
}

// ---------------------------------------------------------------------------
// CarryBee
// ---------------------------------------------------------------------------

// Reverse-engineered from CarryBee's live rate-calculator API (not an
// estimate — see lib/carrybeePricing.ts for provenance/caveats). CarryBee
// prices real district-to-district pairs, and its ids happen to equal this
// app's canonical ones (see lib/districts.ts) — except the synthetic "Dhaka
// Sub-Urban" entry, which CarryBee has no id for, so it's substituted with a
// real representative (Gazipur) before calling into the engine.
function carryBeeDistrictId(canonicalId: number): number {
  return canonicalId === DHAKA_SUBURB_PSEUDO_ID ? CANONICAL_DISTRICT.SUBURB_REPRESENTATIVE : canonicalId;
}

function carryBeeZoneLabel(fromId: number, toId: number): string {
  if (fromId === toId) {
    return fromId === CARRYBEE_DHAKA_CITY_ID ? "Same City Dhaka" : `Same City ${getDistrictName(fromId)}`;
  }
  return `${getDistrictName(fromId)} to ${getDistrictName(toId)}`;
}

const CARRYBEE_COD_RATE = 0.01; // ESTIMATED — the live API only returns the delivery fee.

export function calculateCarryBee(input: CalculatorInput): CourierResult {
  const { base, overage, slabNote } = calculateCarryBeeFee({
    fromCityId: carryBeeDistrictId(input.pickupDistrictId),
    toCityId: carryBeeDistrictId(input.deliveryDistrictId),
    weightKg: input.weightKg,
  });
  const codCharge = input.isCOD ? round(input.productPrice * CARRYBEE_COD_RATE) : 0;

  return {
    courier: "CarryBee",
    zoneLabel: carryBeeZoneLabel(input.pickupDistrictId, input.deliveryDistrictId),
    baseCharge: base,
    overageCharge: overage,
    codCharge,
    totalCharge: round(base + overage + codCharge),
    slabNote,
  };
}

// ---------------------------------------------------------------------------
// Steadfast
// ---------------------------------------------------------------------------

/**
 * `CANONICAL_DISTRICT` names a few app-level ids used across couriers: the
 * canonical list (lib/districts.ts) happens to equal CarryBee's real ids, so
 * these double as CarryBee references too, but they're not Steadfast's ids —
 * Steadfast has its own numbering (see lib/steadfastPricing.ts) and needs
 * translation via `resolveSteadfastDistrictId`.
 */
export const CANONICAL_DISTRICT = {
  DHAKA: 14,
  // Representative non-Dhaka district (Bagerhat) — stands in for the generic
  // "Outside Dhaka" zone in bulk CSV rows, which don't carry a real district.
  OTHER_DISTRICT: 1,
  // Representative "Suburbs" district (Gazipur) — same purpose, for bulk
  // rows, and for translating the synthetic Dhaka Sub-Urban pick into a real
  // CarryBee city (CarryBee has no distinct id for it either).
  SUBURB_REPRESENTATIVE: 19,
} as const;

// The Dhaka-adjacent districts this app's assumed "Suburbs" bucket covers.
// Live-read by two things: bulk CSV rows (which only carry this generic
// zone, converted to a stand-in real district below) and RedX's single-order
// zoneId (`redxZoneId`, below) — RedX has no per-district suburb list of its
// own, so this stands in for it. Gazipur/Narayanganj/Munshiganj confirmed
// against RedX's own area-rate sheet (every Gazipur/Narayanganj area, and
// most Munshiganj areas, bill at RedX's 90/105/120 suburb tier). Manikganj
// and Narsingdi were removed after that same sheet showed every one of their
// areas billing at the 120/150/180 outside tier instead — including them
// here undercharged those two districts relative to RedX's real rates.
const SUBURB_DISTRICT_IDS = new Set([
  19, // Gazipur
  43, // Narayanganj
  39, // Munshiganj
  DHAKA_SUBURB_PSEUDO_ID,
]);

/** Buckets a real district into a generic zone — used only for bulk CSV export/display now. */
export function genericLocationFromDistrict(districtId: number): GenericLocation {
  if (districtId === CANONICAL_DISTRICT.DHAKA) return "INSIDE_DHAKA";
  if (SUBURB_DISTRICT_IDS.has(districtId)) return "SUBURBS";
  return "OUTSIDE_DHAKA";
}

// Reverse mapping, for bulk CSV rows: they only carry a generic zone, so pick
// one real (canonical) district to stand in for every courier's from/to id.
export const REPRESENTATIVE_DISTRICT_FOR_GENERIC: Record<GenericLocation, number> = {
  INSIDE_DHAKA: CANONICAL_DISTRICT.DHAKA,
  SUBURBS: CANONICAL_DISTRICT.SUBURB_REPRESENTATIVE,
  OUTSIDE_DHAKA: CANONICAL_DISTRICT.OTHER_DISTRICT,
};

// Steadfast prices real district-to-district pairs too, but its ids are a
// completely different numbering scheme (see lib/steadfastPricing.ts) — this
// translates a canonical district id into Steadfast's own id via its name,
// with the synthetic Dhaka Sub-Urban pick short-circuited to Steadfast's
// real (and, for this one district, confirmed) Dhaka Sub-Urban id.
function steadfastDistrictIdFor(canonicalId: number): number {
  if (canonicalId === DHAKA_SUBURB_PSEUDO_ID) return STEADFAST_DHAKA_SUBURBAN;
  return resolveSteadfastDistrictId(getDistrictName(canonicalId)) ?? STEADFAST_DHAKA_CITY;
}

// Zone labels stay in this app's canonical names (what the user actually
// picked), even though the calculation underneath runs on Steadfast's ids.
function steadfastZoneLabel(canonicalPickupId: number, canonicalDeliveryId: number): string {
  if (canonicalPickupId === canonicalDeliveryId) {
    return canonicalPickupId === CANONICAL_DISTRICT.DHAKA
      ? "Same City Dhaka"
      : `Same City ${getDistrictName(canonicalPickupId)}`;
  }
  return `${getDistrictName(canonicalPickupId)} to ${getDistrictName(canonicalDeliveryId)}`;
}

export function calculateSteadfast(input: CalculatorInput): CourierResult {
  const { base, overage, slabNote } = computeSteadfastCharge({
    fromId: steadfastDistrictIdFor(input.pickupDistrictId),
    toId: steadfastDistrictIdFor(input.deliveryDistrictId),
    category: "REGULAR",
    serviceType: "REGULAR",
    weightKg: input.weightKg,
  });
  const codCharge = input.isCOD ? steadfastCodCharge(input.productPrice) : 0;

  return {
    courier: "Steadfast",
    zoneLabel: steadfastZoneLabel(input.pickupDistrictId, input.deliveryDistrictId),
    baseCharge: base,
    overageCharge: overage,
    codCharge,
    totalCharge: round(base + overage + codCharge),
    slabNote,
  };
}

// ---------------------------------------------------------------------------
// Aggregate helper used by the dashboard.
// ---------------------------------------------------------------------------

export function getAllQuotes(input: CalculatorInput): CourierResult[] {
  return [
    calculatePathao(input),
    calculateRedX(input),
    calculateCarryBee(input),
    calculateSteadfast(input),
  ].sort(
    (a, b) => a.totalCharge - b.totalCharge,
  );
}
