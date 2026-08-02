import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

// See the note in app/manifest.ts — required under `output: "export"`.
export const dynamic = "force-static";

// `lastModified` is a fixed date per route, not `new Date()` at build time.
// A rebuild-time timestamp would mark every page "changed today" on every
// deploy regardless of whether its content actually changed — a weak,
// inaccurate freshness signal that Google explicitly discounts. Bump a
// route's date by hand when you actually edit that page's content.
const ROUTES: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  lastModified: string;
}> = [
  { path: "/", priority: 1, changeFrequency: "weekly", lastModified: "2026-08-02" },
  { path: "/pathao-delivery-charge-calculator", priority: 0.8, changeFrequency: "monthly", lastModified: "2026-08-02" },
  { path: "/redx-delivery-charge-calculator", priority: 0.8, changeFrequency: "monthly", lastModified: "2026-08-02" },
  { path: "/steadfast-courier-charge-calculator", priority: 0.8, changeFrequency: "monthly", lastModified: "2026-08-02" },
  { path: "/carrybee-delivery-charge-calculator", priority: 0.8, changeFrequency: "monthly", lastModified: "2026-08-02" },
  { path: "/faq", priority: 0.7, changeFrequency: "monthly", lastModified: "2026-08-02" },
  { path: "/about", priority: 0.5, changeFrequency: "yearly", lastModified: "2026-07-30" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
