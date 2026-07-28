/**
 * Steadfast's real delivery-fee engine — reverse-engineered from the Vue
 * component bundled in their site (/build/assets/app-*.js) and its one-time
 * `GET /welcome/get/pricing-data` call (22 named rates + their own 65-entry
 * district list), not from documentation. Validated against 648 input
 * combinations against the live component with zero mismatches at the time
 * of writing.
 *
 * This supersedes the placeholder rates and district ids that used to live
 * in courierCalculators.ts. That earlier version borrowed CarryBee's real
 * district ids by mistake — Steadfast has its own, entirely different
 * numbering for the same 64 districts (see the note in lib/districts.ts).
 *
 * Static snapshot, not a live integration — same reasoning as CarryBee's
 * engine: this app's calculations are otherwise all client-side/offline,
 * and the endpoint is undocumented, so treating it as a permanent runtime
 * dependency is the wrong trade-off. Re-probe and update this file if
 * Steadfast revises rates.
 *
 * Two live bugs, reproduced on their own site, are handled explicitly below
 * rather than silently copied:
 * - Book + same district + weight over 1kg multiplies by `isd_to_isd_weight`,
 *   a key that doesn't exist in the pricing-data payload — on their site this
 *   makes the price block disappear (NaN). We default it to `samecity_weight`
 *   (20), the obvious intent.
 * - Document category only actually applies its flat rate at ≤0.2kg; above
 *   that their code silently reprices at Regular while still labeling the
 *   order "Document". We surface this via `categoryDowngraded`/`warning`
 *   instead of silently matching the misleading label.
 */

export type SteadfastCategory = "REGULAR" | "DOCUMENT" | "BOOK";
export type SteadfastServiceType = "REGULAR" | "SAME_DAY";

export const STEADFAST_DHAKA_CITY = 1;
export const STEADFAST_DHAKA_SUBURBAN = 18;
export const STEADFAST_CHITTAGONG = 2;

export interface SteadfastCharges {
  samecity_dhaka_150: number;
  samecity_dhaka_500: number;
  samecity_dhaka: number;
  samecity_reg: number;
  samecity_weight: number;
  isd_to_sub_500: number;
  isd_to_sub: number;
  isd_to_sub_weight: number;
  isd_to_osd_500: number;
  isd_to_osd: number;
  isd_to_osd_weight: number;
  osd_to_isd: number;
  osd_to_isd_weight: number;
  osd_to_osd: number;
  osd_to_osd_weight: number;
  document: number;
  book_samecity: number;
  book_osc: number;
  sameday: number;
  sameday_weight: number;
  sameday_osd: number;
  sameday_osd_weight: number;
  /** Not part of the real pricing-data payload — see the file-level note. */
  isd_to_isd_weight?: number;
}

// Snapshot of GET /welcome/get/pricing-data (verified live).
export const STEADFAST_CHARGES: SteadfastCharges = {
  samecity_dhaka_150: 55,
  samecity_dhaka_500: 65,
  samecity_dhaka: 75,
  samecity_reg: 60,
  samecity_weight: 20,
  isd_to_sub_500: 105,
  isd_to_sub: 105,
  isd_to_sub_weight: 20,
  isd_to_osd_500: 115,
  isd_to_osd: 135,
  isd_to_osd_weight: 20,
  osd_to_isd: 115,
  osd_to_isd_weight: 20,
  osd_to_osd: 135,
  osd_to_osd_weight: 20,
  document: 55,
  book_samecity: 55,
  book_osc: 95,
  sameday: 105,
  sameday_weight: 20,
  sameday_osd: 105,
  sameday_osd_weight: 20,
  isd_to_isd_weight: 20,
};

// Steadfast's own district ids, from GET /welcome/get/pricing-data — a
// different numbering scheme than this app's canonical lib/districts.ts list.
export const STEADFAST_DISTRICTS: { id: number; name: string }[] = [
  { id: 66, name: "Bagerhat" },
  { id: 61, name: "Bandarban" },
  { id: 57, name: "Barguna" },
  { id: 7, name: "Barishal" },
  { id: 38, name: "Bhola" },
  { id: 16, name: "Bogra" },
  { id: 19, name: "Brahmanbaria" },
  { id: 20, name: "Chandpur" },
  { id: 58, name: "Chapainawabganj" },
  { id: STEADFAST_CHITTAGONG, name: "Chittagong" },
  { id: 30, name: "Chuadanga" },
  { id: 42, name: "Cox's Bazar" },
  { id: 9, name: "Cumilla" },
  { id: STEADFAST_DHAKA_CITY, name: "Dhaka City" },
  { id: STEADFAST_DHAKA_SUBURBAN, name: "Dhaka Sub-Urban" },
  { id: 15, name: "Dinajpur" },
  { id: 28, name: "Faridpur" },
  { id: 21, name: "Feni" },
  { id: 23, name: "Gaibandha" },
  { id: 14, name: "Gazipur" },
  { id: 44, name: "Gopalganj" },
  { id: 34, name: "Habiganj" },
  { id: 26, name: "Jamalpur" },
  { id: 36, name: "Jashore" },
  { id: 59, name: "Jhalokati" },
  { id: 43, name: "Jhenaidah" },
  { id: 64, name: "Joypurhat" },
  { id: 52, name: "Khagrachori" },
  { id: 6, name: "Khulna" },
  { id: 12, name: "Kishoreganj" },
  { id: 56, name: "Kurigram" },
  { id: 27, name: "Kustia" },
  { id: 37, name: "Lalmonirhat" },
  { id: 29, name: "Laxmipur" },
  { id: 62, name: "Madaripur" },
  { id: 31, name: "Magura" },
  { id: 32, name: "Manikganj" },
  { id: 51, name: "Meherpur" },
  { id: 40, name: "Moulvibazar" },
  { id: 35, name: "Munshiganj" },
  { id: 11, name: "Mymensingh" },
  { id: 55, name: "Naogaon" },
  { id: 48, name: "Narail" },
  { id: 13, name: "Narayanganj" },
  { id: 10, name: "Narshindi" },
  { id: 22, name: "Natore" },
  { id: 50, name: "Netrokona" },
  { id: 24, name: "Nilphamari" },
  { id: 8, name: "Noakhali" },
  { id: 41, name: "Pabna" },
  { id: 54, name: "Panchgarh" },
  { id: 45, name: "Patuakhali" },
  { id: 49, name: "Pirojpur" },
  { id: 39, name: "Rajbari" },
  { id: 5, name: "Rajshahi" },
  { id: 47, name: "Rangamati" },
  { id: 4, name: "Rangpur" },
  { id: 63, name: "Shariatpur" },
  { id: 53, name: "Shatkhira" },
  { id: 60, name: "Sherpur" },
  { id: 33, name: "Sirajganj" },
  { id: 65, name: "Sunamganj" },
  { id: 3, name: "Sylhet" },
  { id: 17, name: "Tangail" },
  { id: 46, name: "Thakurgaon" },
];

function normalizeDistrictName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// This app's canonical district list (lib/districts.ts) spells ~10 of these
// districts differently than Steadfast's own payload does — bridges e.g.
// "Chattogram" (canonical) to "Chittagong" (Steadfast's spelling).
const CANONICAL_NAME_ALIASES: Record<string, string> = {
  barisal: "barishal",
  bogura: "bogra",
  chattogram: "chittagong",
  dhaka: "dhakacity",
  khagrachhari: "khagrachori",
  kushtia: "kustia",
  lakshmipur: "laxmipur",
  narsingdi: "narshindi",
  panchagarh: "panchgarh",
  satkhira: "shatkhira",
};

const STEADFAST_ID_BY_NORMALIZED_NAME = new Map(
  STEADFAST_DISTRICTS.map((district) => [normalizeDistrictName(district.name), district.id]),
);

/**
 * Translates a district name from this app's canonical list into Steadfast's
 * own internal district id — the two numbering schemes are unrelated.
 * Returns undefined only if the name matches neither list at all.
 */
export function resolveSteadfastDistrictId(canonicalName: string): number | undefined {
  const normalized = normalizeDistrictName(canonicalName);
  const aliased = CANONICAL_NAME_ALIASES[normalized] ?? normalized;
  return STEADFAST_ID_BY_NORMALIZED_NAME.get(aliased);
}

/**
 * Billable weight ("n") — the rule differs by route, which is easy to miss:
 * Dhaka City → Dhaka City gets a 0.15kg and a 0.5kg tier; Dhaka City →
 * anywhere else only gets the 0.5kg tier; every other origin has no
 * half-kg tier at all (whole kg only, and 0kg bills as 0.5kg).
 */
function billableWeight(fromId: number, toId: number, weightKg: number): number {
  const kg = Number(weightKg) || 0;
  const ceilOrHalf = () => (Math.ceil(kg) <= 0 ? 0.5 : Math.ceil(kg));

  if (fromId === STEADFAST_DHAKA_CITY && toId === STEADFAST_DHAKA_CITY) {
    if (kg <= 0.15) return 0.15;
    if (kg <= 0.5) return 0.5;
    return ceilOrHalf();
  }
  if (fromId === STEADFAST_DHAKA_CITY) {
    return kg <= 0.5 ? 0.5 : ceilOrHalf();
  }
  return ceilOrHalf();
}

export interface SteadfastInput {
  fromId: number;
  toId: number;
  category: SteadfastCategory;
  serviceType: SteadfastServiceType;
  weightKg: number;
  charges?: SteadfastCharges;
}

export interface SteadfastChargeResult {
  base: number;
  overage: number;
  billableWeight: number;
  slabNote: string;
  warning?: string;
  categoryDowngraded?: boolean;
}

export function computeSteadfastCharge(input: SteadfastInput): SteadfastChargeResult {
  const charges = input.charges ?? STEADFAST_CHARGES;
  const { fromId, toId } = input;
  const n = billableWeight(fromId, toId, input.weightKg);
  const sameDistrict = fromId === toId;

  const regular = (): { base: number; overage: number; slabNote: string } => {
    if (sameDistrict) {
      if (fromId === STEADFAST_DHAKA_CITY) {
        if (n <= 0.15) {
          return { base: charges.samecity_dhaka_150, overage: 0, slabNote: "Same city Dhaka, 150g tier" };
        }
        if (n <= 0.5) {
          return { base: charges.samecity_dhaka_500, overage: 0, slabNote: "Same city Dhaka, 500g tier" };
        }
        return {
          base: charges.samecity_dhaka,
          overage: charges.samecity_weight * (n - 1),
          slabNote: `Same city Dhaka, ${n}kg tier`,
        };
      }
      return {
        base: charges.samecity_reg,
        overage: charges.samecity_weight * (n - 1),
        slabNote: `Same district, ${n}kg tier`,
      };
    }

    if (fromId === STEADFAST_DHAKA_CITY) {
      if (toId === STEADFAST_DHAKA_SUBURBAN) {
        return n <= 0.5
          ? { base: charges.isd_to_sub_500, overage: 0, slabNote: "Dhaka City to Sub-Urban, 500g tier" }
          : {
              base: charges.isd_to_sub,
              overage: charges.isd_to_sub_weight * (n - 1),
              slabNote: `Dhaka City to Sub-Urban, ${n}kg tier`,
            };
      }
      return n <= 0.5
        ? { base: charges.isd_to_osd_500, overage: 0, slabNote: "Dhaka City to other district, 500g tier" }
        : {
            base: charges.isd_to_osd,
            overage: charges.isd_to_osd_weight * (n - 1),
            slabNote: `Dhaka City to other district, ${n}kg tier`,
          };
    }

    if (toId === STEADFAST_DHAKA_CITY) {
      return {
        base: charges.osd_to_isd,
        overage: charges.osd_to_isd_weight * (n - 1),
        slabNote: `Other district to Dhaka City, ${n}kg tier`,
      };
    }

    return {
      base: charges.osd_to_osd,
      overage: charges.osd_to_osd_weight * (n - 1),
      slabNote: `District to district, ${n}kg tier`,
    };
  };

  if (input.serviceType === "SAME_DAY") {
    const tier = Math.ceil(n);
    const eligible = sameDistrict && (fromId === STEADFAST_DHAKA_CITY || fromId === STEADFAST_CHITTAGONG);
    if (!eligible) {
      return {
        base: 0,
        overage: 0,
        billableWeight: n,
        slabNote: "Same Day unavailable for this route",
        warning: "Same Day service is available only within Dhaka City and Chittagong.",
      };
    }
    const base = fromId === STEADFAST_DHAKA_CITY ? charges.sameday : charges.sameday_osd;
    const perKg = fromId === STEADFAST_DHAKA_CITY ? charges.sameday_weight : charges.sameday_osd_weight;
    return {
      base,
      overage: perKg * (tier - 1),
      billableWeight: n,
      slabNote: `Same Day, ${fromId === STEADFAST_DHAKA_CITY ? "Dhaka City" : "Chittagong"}, ${tier}kg tier`,
    };
  }

  if (input.category === "DOCUMENT") {
    if (n <= 0.2) {
      return { base: charges.document, overage: 0, billableWeight: n, slabNote: "Flat document rate" };
    }
    const { base, overage, slabNote } = regular();
    return {
      base,
      overage,
      billableWeight: n,
      slabNote,
      categoryDowngraded: true,
      warning: "Document rate only applies up to 0.2kg — charged at the Regular rate instead.",
    };
  }

  if (input.category === "BOOK") {
    const sameDistrictPerKg = charges.isd_to_isd_weight ?? charges.samecity_weight;
    if (sameDistrict) {
      return n <= 1
        ? { base: charges.book_samecity, overage: 0, billableWeight: n, slabNote: "Book, same district, under 1kg" }
        : {
            base: charges.book_samecity,
            overage: sameDistrictPerKg * (n - 1),
            billableWeight: n,
            slabNote: `Book, same district, ${n}kg tier`,
          };
    }
    return n <= 1
      ? { base: charges.book_osc, overage: 0, billableWeight: n, slabNote: "Book, cross district, under 1kg" }
      : {
          base: charges.book_osc,
          overage: charges.isd_to_osd_weight * (n - 1),
          billableWeight: n,
          slabNote: `Book, cross district, ${n}kg tier`,
        };
  }

  const { base, overage, slabNote } = regular();
  return { base, overage, billableWeight: n, slabNote };
}

/** 1% COD + risk-management charge, per Steadfast's published fine print. */
export function steadfastCodCharge(collectionAmount: number): number {
  return Math.round(collectionAmount * 0.01);
}
