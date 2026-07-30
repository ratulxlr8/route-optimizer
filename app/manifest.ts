import type { MetadataRoute } from "next";

import { SITE_NAME } from "@/lib/site";

// Required for these generated metadata routes under `output: "export"` —
// without it, Next treats the route as potentially dynamic and refuses to
// prerender it into the static export (see next.config.ts's own note on why
// this app is a static export in the first place).
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Courier Charge Calculator`,
    short_name: SITE_NAME,
    description:
      "Compare Pathao, RedX, CarryBee, and Steadfast courier charges instantly and auto-split bulk orders to the cheapest courier.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f5f7",
    theme_color: "#006a4e",
    orientation: "portrait-primary",
    lang: "en",
    categories: ["business", "utilities", "shopping"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
