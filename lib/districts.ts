/**
 * This app's canonical district list — used to populate the Pickup/Delivery
 * selectors, and as the id space for Pathao/RedX's generic-zone bucketing.
 *
 * These ids are CarryBee's real city ids (confirmed via their live
 * price-calculation API — see lib/carrybeePricing.ts), NOT Steadfast's.
 * Earlier code mislabeled this list as Steadfast's own city list, but
 * Steadfast's real district ids (from probing their pricing-data endpoint —
 * see lib/steadfastPricing.ts) are a completely different numbering scheme
 * for the same 64 districts (e.g. Dhaka is id 14 here, id 1 for Steadfast).
 * `resolveSteadfastDistrictId` in lib/steadfastPricing.ts translates a
 * canonical name here into Steadfast's own id.
 *
 * `DHAKA_SUBURB_PSEUDO_ID` is a synthetic 65th entry, not a real id from
 * either courier's API: Steadfast has a real, distinct "Dhaka Sub-Urban"
 * district (id 18) with its own rates, but this canonical list (and
 * CarryBee's real districts) has no such separate entry — without this,
 * users could never select the zone Steadfast actually prices differently.
 */

export interface District {
  id: number;
  name: string;
}

export const DHAKA_SUBURB_PSEUDO_ID = 1000;

export const BANGLADESH_DISTRICTS: District[] = [
  { id: 1, name: "Bagerhat" },
  { id: 2, name: "Bandarban" },
  { id: 3, name: "Barguna" },
  { id: 4, name: "Barisal" },
  { id: 5, name: "Bhola" },
  { id: 6, name: "Bogura" },
  { id: 7, name: "Brahmanbaria" },
  { id: 8, name: "Chandpur" },
  { id: 9, name: "Chapainawabganj" },
  { id: 10, name: "Chattogram" },
  { id: 11, name: "Chuadanga" },
  { id: 12, name: "Cox's bazar" },
  { id: 13, name: "Cumilla" },
  { id: 14, name: "Dhaka" },
  { id: DHAKA_SUBURB_PSEUDO_ID, name: "Dhaka Sub-Urban" },
  { id: 15, name: "Dinajpur" },
  { id: 16, name: "Faridpur" },
  { id: 17, name: "Feni" },
  { id: 18, name: "Gaibandha" },
  { id: 19, name: "Gazipur" },
  { id: 20, name: "Gopalganj" },
  { id: 21, name: "Habiganj" },
  { id: 22, name: "Jamalpur" },
  { id: 23, name: "Jashore" },
  { id: 24, name: "Jhalokati" },
  { id: 25, name: "Jhenaidah" },
  { id: 26, name: "Joypurhat" },
  { id: 27, name: "Khagrachhari" },
  { id: 28, name: "Khulna" },
  { id: 29, name: "Kishoreganj" },
  { id: 30, name: "Kurigram" },
  { id: 31, name: "Kushtia" },
  { id: 32, name: "Lakshmipur" },
  { id: 33, name: "Lalmonirhat" },
  { id: 34, name: "Madaripur" },
  { id: 35, name: "Magura" },
  { id: 36, name: "Manikganj" },
  { id: 37, name: "Meherpur" },
  { id: 38, name: "Moulvibazar" },
  { id: 39, name: "Munshiganj" },
  { id: 40, name: "Mymensingh" },
  { id: 41, name: "Naogaon" },
  { id: 42, name: "Narail" },
  { id: 43, name: "Narayanganj" },
  { id: 44, name: "Narsingdi" },
  { id: 45, name: "Natore" },
  { id: 46, name: "Netrokona" },
  { id: 47, name: "Nilphamari" },
  { id: 48, name: "Noakhali" },
  { id: 49, name: "Pabna" },
  { id: 50, name: "Panchagarh" },
  { id: 51, name: "Patuakhali" },
  { id: 52, name: "Pirojpur" },
  { id: 53, name: "Rajbari" },
  { id: 54, name: "Rajshahi" },
  { id: 55, name: "Rangamati" },
  { id: 56, name: "Rangpur" },
  { id: 57, name: "Satkhira" },
  { id: 58, name: "Shariatpur" },
  { id: 59, name: "Sherpur" },
  { id: 60, name: "Sirajganj" },
  { id: 61, name: "Sunamganj" },
  { id: 62, name: "Sylhet" },
  { id: 63, name: "Tangail" },
  { id: 64, name: "Thakurgaon" },
];

const DISTRICT_BY_ID = new Map(BANGLADESH_DISTRICTS.map((district) => [district.id, district]));

export function getDistrictName(id: number): string {
  return DISTRICT_BY_ID.get(id)?.name ?? `District #${id}`;
}
