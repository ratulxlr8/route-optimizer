/**
 * RedX's real delivery-fee engine — reverse-engineered from their homepage
 * calculator's network calls (`GET /v2/area-tree`, `GET
 * /v4/logistics/charge-calculator`), not from documentation. The rate table,
 * weight-rounding rule, and route classification below are verified exact.
 *
 * One real gap: RedX's route classification is decided by AREA (2,838 of
 * them across 8 divisions), each with its own zoneId (1 Inside Dhaka / 2
 * Dhaka Suburb / 7 Outside Dhaka) and districtId — not by district alone.
 * This app only has district-level pickup/delivery selection (no area-tree
 * data was provided), so `classifyRedxRoute` is fed an approximation:
 * zoneId derived from this app's existing generic-zone bucketing
 * (`genericLocationFromDistrict`), and districtId = the canonical district
 * id itself (valid for the same-district check, since "same real-world
 * district" doesn't depend on whose numbering scheme labels it).
 *
 * The real quirks this can't reproduce without the actual area tree: two
 * Outside-Dhaka areas in the *same* district get the cheap inside-city rate
 * (we can still get this right, since it only needs same-district, not the
 * specific areas), but two Suburb areas in *different* districts within
 * Dhaka division still get the suburb rate rather than outside (we get this
 * right too, structurally) — what we can't reproduce is a single district
 * whose areas actually split across two zones (e.g. Dhaka district itself
 * likely has both zone-1 and zone-2 areas); this app treats a whole
 * canonical district as one zone.
 *
 * Static snapshot, not a live integration — same reasoning as CarryBee's and
 * Steadfast's engines. Re-probe and update this file if RedX revises rates.
 */

export const REDX_ZONE = { INSIDE_DHAKA: 1, DHAKA_SUBURB: 2, OUTSIDE_DHAKA: 7 } as const;

export type RedxRouteClass = "INSIDE_CITY" | "SUBURB" | "OUTSIDE";

export interface RedxAreaLike {
  zoneId: number;
  districtId: number;
}

interface RedxRate {
  base: number;
  perKg: number;
  codPct: number;
  returnPct: number;
}

const REDX_RATES: Record<RedxRouteClass, RedxRate> = {
  INSIDE_CITY: { base: 65, perKg: 15, codPct: 0, returnPct: 0 },
  SUBURB: { base: 90, perKg: 15, codPct: 0.01, returnPct: 0.5 },
  OUTSIDE: { base: 120, perKg: 30, codPct: 0.01, returnPct: 0.5 },
};

/**
 * Checked in order: both areas Inside Dhaka → inside-city; same zone AND
 * same district → inside-city (even Outside-Dhaka areas, if same district);
 * both zones in {Inside Dhaka, Dhaka Suburb} → suburb; otherwise outside.
 */
export function classifyRedxRoute(pickup: RedxAreaLike, delivery: RedxAreaLike): RedxRouteClass {
  const { INSIDE_DHAKA, DHAKA_SUBURB } = REDX_ZONE;
  if (pickup.zoneId === INSIDE_DHAKA && delivery.zoneId === INSIDE_DHAKA) return "INSIDE_CITY";
  if (pickup.zoneId === delivery.zoneId && pickup.districtId === delivery.districtId) {
    return "INSIDE_CITY";
  }
  const bothDhaka = (zoneId: number) => zoneId === INSIDE_DHAKA || zoneId === DHAKA_SUBURB;
  if (bothDhaka(pickup.zoneId) && bothDhaka(delivery.zoneId)) return "SUBURB";
  return "OUTSIDE";
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export interface RedxChargeResult {
  routeClass: RedxRouteClass;
  base: number;
  overage: number;
  codCharge: number;
  /** Only charged if the parcel is returned — not part of a normal quote. */
  returnCharge: number;
  billableExtraKg: number;
  slabNote: string;
}

/** Mirrors RedX's /v4/logistics/charge-calculator exactly (verified against the live API). */
export function calculateRedxCharges(input: {
  pickup: RedxAreaLike;
  delivery: RedxAreaLike;
  weightKg: number;
  price: number;
}): RedxChargeResult {
  const w = Number(input.weightKg) || 0;
  const routeClass = classifyRedxRoute(input.pickup, input.delivery);
  const rate = REDX_RATES[routeClass];

  // Up to and including 5kg, weight rounds up to a whole kg; above 5kg the
  // exact fractional weight is billed instead (3.2kg and 4.0kg both cost the
  // same; 5.5kg does not cost the same as 6kg).
  const extra = w <= 5 ? Math.max(0, Math.ceil(w) - 1) : w - 1;
  const overage = round2(rate.perKg * extra);
  const deliveryCharge = round2(rate.base + overage);
  const codCharge = round2(input.price * rate.codPct);
  const returnCharge = round2(deliveryCharge * rate.returnPct);

  return {
    routeClass,
    base: rate.base,
    overage,
    codCharge,
    returnCharge,
    billableExtraKg: extra,
    slabNote:
      extra > 0
        ? `${rate.base} base + ${extra}kg over 1kg @ ${rate.perKg}/kg`
        : `${w}kg fits the 1kg base rate`,
  };
}
