import type { Metadata } from "next";

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

// Google truncates <meta name="description"> at roughly 155-160 characters,
// so SITE_DESCRIPTION_EN (written for JSON-LD and the About page, where
// length isn't penalized) is too long for that tag and gets cut mid-sentence
// in search results. This shorter variant is what actually goes in
// <meta name="description">, openGraph.description, and twitter.description.
export const SITE_DESCRIPTION_META =
  "Compare Pathao, RedX, CarryBee, and Steadfast courier charges instantly and auto-split bulk orders to the cheapest one — free, no sign-up.";

export const SITE_TAGLINE_EN = "Smart courier charge calculator & auto-splitter for Bangladesh";

/**
 * Shared metadata builder for every static content page (FAQ, About, the
 * four courier landing pages). Without this, pages that only set `title` and
 * `description` silently inherit the root layout's generic `openGraph` /
 * `twitter` objects — Next doesn't merge those per-field, it takes whichever
 * layer last defined the whole object — so sharing a page's link on
 * Facebook/Slack/X showed the homepage's preview card, not that page's own.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const socialTitle = `${title} | ${SITE_NAME}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: socialTitle, description, url: path },
    twitter: { title: socialTitle, description },
  };
}

/** BreadcrumbList JSON-LD for the static content pages (SERP breadcrumb rich
 *  results). `items` excludes the implicit root; callers pass only the
 *  segments after Home. */
export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...items].map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
