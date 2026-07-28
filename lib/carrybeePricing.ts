/**
 * CarryBee's real delivery-fee engine — reverse-engineered from the network
 * calls their public rate-calculator widget makes (`GET
 * /api/v2/orders/price-calculation?delivery_type=1&item_type=&weight=&from=&to=`),
 * not from documentation. Validated against 200 randomized live calls with
 * zero mismatches at the time of writing.
 *
 * This is a static snapshot, not a live integration: if CarryBee revises
 * their rates, these numbers go stale. Deliberately not wired to the live
 * endpoint — this app's calculations are all client-side/offline by design
 * (see the architecture note in the README), and the endpoint itself is
 * undocumented, so treating it as a permanent runtime dependency would be
 * the wrong trade-off. Re-probe and update this file if rates drift.
 *
 * The live endpoint's `delivery_fee` is delivery only — `discount` and
 * `total_fee` are always 0 in the response, so COD, returns, or any
 * merchant-specific contract rate aren't part of this table. See
 * `CARRYBEE_COD_RATE` in courierCalculators.ts for this app's (separately
 * estimated) COD assumption layered on top.
 */

export type CarryBeeItemType = 1 | 2;

export type CarryBeeZoneKey =
  | "SAME_CITY"
  | "DHAKA_SUBURB"
  | "DHAKA_OUTSIDE"
  | "TO_DHAKA"
  | "OUTSIDE_OUTSIDE";

export const CARRYBEE_DHAKA_CITY_ID = 14;
// Dhaka's "sub-urban" zone is specifically Gazipur + Narayanganj for
// CarryBee — narrower than this app's shared Suburbs bucket used for
// Pathao/RedX (which also includes Munshiganj, Manikganj, Narsingdi, since
// those two don't have a confirmed real definition of their own).
export const CARRYBEE_DHAKA_SUBURB_IDS = [19, 43];

interface CarryBeeRate {
  /** Flat prices for the ≤0.2, ≤0.5, ≤1, ≤1.5, ≤2, ≤2.5, ≤3 kg buckets. */
  buckets: [number, number, number, number, number, number, number];
  /** Price at exactly 4kg — the first whole-kg tier above the 3kg bucket. */
  fourKg: number;
  /** Flat per-kg charge for every whole kg above 4kg. */
  perExtraKg: number;
}

// item_type=1 is what CarryBee's own widget uses (item_type=3 is identical);
// item_type=2 is a slightly cheaper table for a different item classification
// this app doesn't currently expose a selector for, so it's kept here for
// completeness but unused — same pattern as Steadfast's Document/Book rates.
const CARRYBEE_RATES: Record<CarryBeeItemType, Record<CarryBeeZoneKey, CarryBeeRate>> = {
  1: {
    SAME_CITY: { buckets: [49, 60, 70, 80, 90, 100, 110], fourKg: 130, perExtraKg: 20 },
    DHAKA_SUBURB: { buckets: [80, 85, 100, 120, 125, 135, 150], fourKg: 170, perExtraKg: 20 },
    DHAKA_OUTSIDE: { buckets: [99, 105, 125, 140, 150, 160, 170], fourKg: 195, perExtraKg: 25 },
    TO_DHAKA: { buckets: [99, 105, 110, 125, 125, 150, 160], fourKg: 185, perExtraKg: 25 },
    OUTSIDE_OUTSIDE: { buckets: [125, 125, 135, 145, 155, 165, 170], fourKg: 195, perExtraKg: 25 },
  },
  2: {
    SAME_CITY: { buckets: [44, 55, 65, 75, 85, 95, 100], fourKg: 120, perExtraKg: 20 },
    DHAKA_SUBURB: { buckets: [75, 80, 95, 115, 120, 130, 135], fourKg: 155, perExtraKg: 20 },
    DHAKA_OUTSIDE: { buckets: [94, 100, 120, 135, 145, 155, 160], fourKg: 185, perExtraKg: 25 },
    TO_DHAKA: { buckets: [94, 100, 105, 120, 130, 145, 150], fourKg: 175, perExtraKg: 25 },
    OUTSIDE_OUTSIDE: { buckets: [120, 120, 130, 140, 150, 160, 165], fourKg: 190, perExtraKg: 25 },
  },
};

const BUCKET_LIMITS_KG = [0.2, 0.5, 1, 1.5, 2, 2.5, 3] as const;

export function resolveCarryBeeZone(fromCityId: number, toCityId: number): CarryBeeZoneKey {
  if (fromCityId === toCityId) return "SAME_CITY";
  if (fromCityId === CARRYBEE_DHAKA_CITY_ID) {
    return CARRYBEE_DHAKA_SUBURB_IDS.includes(toCityId) ? "DHAKA_SUBURB" : "DHAKA_OUTSIDE";
  }
  if (toCityId === CARRYBEE_DHAKA_CITY_ID) return "TO_DHAKA";
  return "OUTSIDE_OUTSIDE";
}

export interface CarryBeeFeeBreakdown {
  base: number;
  overage: number;
  slabNote: string;
}

export function calculateCarryBeeFee(opts: {
  fromCityId: number;
  toCityId: number;
  weightKg: number;
  itemType?: CarryBeeItemType;
}): CarryBeeFeeBreakdown {
  const { fromCityId, toCityId, weightKg, itemType = 1 } = opts;

  // Mirrors the live API: it takes grams, so kg gets rounded to 2 decimals
  // via a grams round-trip (3.001kg behaves as 3.00kg, 3.005kg as 3.01kg).
  const grams = Math.round(weightKg * 1000);
  const w = Math.round(grams / 10) / 100;

  const rate = CARRYBEE_RATES[itemType][resolveCarryBeeZone(fromCityId, toCityId)];

  for (let i = 0; i < BUCKET_LIMITS_KG.length; i++) {
    if (w <= BUCKET_LIMITS_KG[i]) {
      return {
        base: rate.buckets[i],
        overage: 0,
        slabNote: `${w}kg fits the up-to-${BUCKET_LIMITS_KG[i]}kg slab`,
      };
    }
  }

  const wholeKg = Math.max(4, Math.ceil(w));
  const overageKg = wholeKg - 4;
  return {
    base: rate.fourKg,
    overage: overageKg * rate.perExtraKg,
    slabNote:
      overageKg > 0
        ? `4kg base + ${overageKg}kg overage @ ${rate.perExtraKg}/kg`
        : `${w}kg rounds up to the 4kg tier`,
  };
}
