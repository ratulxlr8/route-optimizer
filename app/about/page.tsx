import type { Metadata } from "next";

import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingNav } from "@/components/marketing-nav";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "How FleetSplit sources its Pathao, RedX, CarryBee, and Steadfast rate data, and why it's built as a free, client-side-only calculator.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="app-canvas flex min-h-full flex-col">
      <MarketingNav />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10 text-sm leading-relaxed text-muted-foreground sm:px-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">About {SITE_NAME}</h1>
          <p className="mt-3">
            Bangladeshi e-commerce and F-commerce sellers routinely juggle four different courier apps just to find
            out which one is cheapest for a single delivery — and with dozens or hundreds of orders a day, doing that
            by hand isn&apos;t realistic. {SITE_NAME} exists to answer one question instantly: for this specific
            pickup zone, delivery zone, weight, and price, which courier actually costs the least?
          </p>
        </div>

        <div>
          <h2 className="text-base font-medium text-foreground">Where the rates come from</h2>
          <p className="mt-2">
            Every rate table in {SITE_NAME} — Pathao&apos;s metro-zone and weight-tier logic, RedX&apos;s route
            classification and weight-rounding rule, CarryBee&apos;s zone and weight-bucket rates, and
            Steadfast&apos;s district-pair pricing — is reverse-engineered directly from that courier&apos;s own live
            rate calculator, not estimated from published brochures. They are static snapshots rather than a live
            integration, so a courier revising its rates won&apos;t be reflected until this app is updated; always
            confirm the final charge with the courier before dispatch.
          </p>
        </div>

        <div>
          <h2 className="text-base font-medium text-foreground">Nothing leaves your browser</h2>
          <p className="mt-2">
            {SITE_NAME} has no backend, no account system, and no database. It&apos;s a static site — every
            calculation, single order or bulk upload, runs client-side in your own browser tab. Your order data is
            never transmitted anywhere.
          </p>
        </div>

        <div>
          <h2 className="text-base font-medium text-foreground">Independent, not affiliated</h2>
          <p className="mt-2">
            {SITE_NAME} is an independent comparison tool and is not affiliated with, endorsed by, or operated by
            Pathao, RedX, CarryBee, or Steadfast. All trademarks belong to their respective owners.
          </p>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
