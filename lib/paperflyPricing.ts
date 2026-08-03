/**
 * Paperfly's real delivery-fee rate card — from their own published charges
 * page (paperfly.com.bd/charges/), not an estimate. The weight-rounding rule
 * (first kg bundled into the base, remainder rounded up to a whole kg) isn't
 * spelled out on that page but is standard courier volumetric practice and
 * matches how Paperfly bills in practice — same "documented assumption"
 * caveat style as RedX's rounding rule in lib/redxPricing.ts.
 *
 * Zone classification gap: Paperfly's real "Periphery/Suburb" zone is
 * defined per-merchant (Savar/Keraniganj/Dohar/Tongi/Gazipur/Narayanganj for
 * Dhaka-based merchants, or the non-Sadar areas of the merchant's own
 * district otherwise). Four of those six are Dhaka *upazilas*, not separate
 * entries in this app's 64-district list, so they can't be selected
 * distinctly. `paperflyZoneFor` in courierCalculators.ts approximates this
 * with the same Dhaka-adjacent district bucket RedX/Steadfast already use
 * (`SUBURB_DISTRICT_IDS`) — and, like RedX's area-tree gap, cannot reproduce
 * the non-Dhaka "Sadar vs. rest of district" distinction at all, since this
 * app only selects at district granularity, not sub-district.
 */

export type PaperflyZone = "SAME_CITY" | "PERIPHERY" | "REST_OF_BD";

interface PaperflyRate {
  base: number;
  codPct: number;
}

export const PAPERFLY_RATES: Record<PaperflyZone, PaperflyRate> = {
  SAME_CITY: { base: 70, codPct: 0 },
  PERIPHERY: { base: 110, codPct: 0.01 },
  REST_OF_BD: { base: 130, codPct: 0.01 },
};

export const PAPERFLY_PER_ADDITIONAL_KG = 20;
export const PAPERFLY_MAX_WEIGHT_KG = 8;

const EXCHANGE_MULTIPLIER = 0.5;

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export interface PaperflyChargeResult {
  zone: PaperflyZone;
  base: number;
  overage: number;
  codCharge: number;
  /** Only charged for an exchange/partial-delivery order — not part of a
   *  normal quote (same convention as RedX's `returnCharge`). This app's
   *  `CalculatorInput` has no exchange flag today, so callers currently
   *  always get 0 here; kept for when that dimension exists. */
  exchangeCharge: number;
  billableExtraKg: number;
  slabNote: string;
}

/** Mirrors Paperfly's published rate card exactly (verified against their
 *  worked examples: 2.3kg to Rest of BD with ৳2,500 COD = ৳195 total;
 *  1kg exchange to Periphery with ৳1,200 COD = ৳177 total). */
export function calculatePaperflyCharges(input: {
  zone: PaperflyZone;
  weightKg: number;
  price: number;
  isExchange?: boolean;
}): PaperflyChargeResult {
  const w = Number(input.weightKg) || 0;
  const rate = PAPERFLY_RATES[input.zone];

  // Step 2: first kg is bundled into the base; round the remainder up.
  const extra = Math.max(0, Math.ceil(w) - 1);
  const overage = round2(PAPERFLY_PER_ADDITIONAL_KG * extra);
  const base = rate.base;

  // Step 3: COD on the collected amount.
  const codCharge = round2(Math.max(0, input.price) * rate.codPct);

  // Step 4: exchange/partial delivery adds half the delivery charge (base + overage).
  const exchangeCharge = input.isExchange ? round2((base + overage) * EXCHANGE_MULTIPLIER) : 0;

  return {
    zone: input.zone,
    base,
    overage,
    codCharge,
    exchangeCharge,
    billableExtraKg: extra,
    slabNote:
      extra > 0
        ? `${base} base + ${extra}kg over 1kg @ ${PAPERFLY_PER_ADDITIONAL_KG}/kg`
        : `${w}kg fits the 1kg base rate`,
  };
}
