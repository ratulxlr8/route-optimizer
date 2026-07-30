import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

// See the note in app/manifest.ts — required under `output: "export"`.
export const dynamic = "force-static";

const ROUTES: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/pathao-delivery-charge-calculator", priority: 0.8, changeFrequency: "monthly" },
  { path: "/redx-delivery-charge-calculator", priority: 0.8, changeFrequency: "monthly" },
  { path: "/steadfast-courier-charge-calculator", priority: 0.8, changeFrequency: "monthly" },
  { path: "/carrybee-delivery-charge-calculator", priority: 0.8, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.7, changeFrequency: "monthly" },
  { path: "/about", priority: 0.5, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
