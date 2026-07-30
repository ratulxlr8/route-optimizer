/**
 * Single source of truth for the domain and brand strings that metadata,
 * JSON-LD, the sitemap, robots.txt, and the PWA manifest all need. Kept in
 * one file so the production domain only has to change in one place.
 */
export const SITE_URL = "https://fleetsplit.com";
export const SITE_NAME = "FleetSplit";

// Bengali speakers searching by ear (not by spelling) commonly type the
// English name phonetically rather than translating it — these variants are
// real observed search patterns for Bengali-script/Banglish product names,
// not filler. They're surfaced in visible FAQ copy and structured data (not
// stuffed into <meta keywords>) so they can actually match a search query.
export const NAME_VARIANTS = [
  "Fleet Split",
  "Flitspit",
  "Flit Split",
  "ফ্লিটস্প্লিট",
  "ফ্লিট স্প্লিট",
] as const;

export const SITE_DESCRIPTION_EN =
  "Compare Pathao, RedX, CarryBee, and Steadfast courier charges instantly and auto-split bulk orders to the cheapest courier for every delivery — free, no sign-up, built for Bangladeshi e-commerce and F-commerce sellers.";

export const SITE_TAGLINE_EN = "Smart courier charge calculator & auto-splitter for Bangladesh";
