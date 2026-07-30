import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

// See the note in app/manifest.ts — required under `output: "export"`.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
