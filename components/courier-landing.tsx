import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingNav } from "@/components/marketing-nav";
import { SITE_NAME } from "@/lib/site";

interface RateRow {
  zone: string;
  rate: string;
}

interface CourierLandingProps {
  courierName: string;
  /** e.g. "delivery charge calculator" or "courier charge calculator" — kept
   *  configurable so the h1 matches the URL slug and <title> exactly
   *  (Steadfast's page/title/slug all say "courier", the other three say
   *  "delivery"). */
  headingSuffix?: string;
  tagline: string;
  intro: string;
  rateRows: RateRow[];
  rateNote: string;
  faqQuestion: string;
  faqAnswer: string;
}

/**
 * Shared template for the courier-specific SEO landing pages
 * (/pathao-delivery-charge-calculator, /redx-..., etc). Each page still
 * supplies its own real rate data pulled from that courier's own pricing
 * module — the template only standardizes layout, not content, so the four
 * pages stay genuinely distinct rather than reading as one page reworded
 * four times.
 */
export function CourierLanding({
  courierName,
  headingSuffix = "delivery charge calculator",
  tagline,
  intro,
  rateRows,
  rateNote,
  faqQuestion,
  faqAnswer,
}: CourierLandingProps) {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: faqQuestion,
        acceptedAnswer: { "@type": "Answer", text: faqAnswer },
      },
    ],
  };

  return (
    <div className="app-canvas flex min-h-full flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <MarketingNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          {courierName} {headingSuffix}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{tagline}</p>
        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{intro}</p>

        <div className="mt-8 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Route</th>
                <th className="px-4 py-2.5 font-medium">{courierName}&apos;s rate</th>
              </tr>
            </thead>
            <tbody>
              {rateRows.map((row) => (
                <tr key={row.zone} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5 font-medium">{row.zone}</td>
                  <td className="numeric px-4 py-2.5 text-muted-foreground">{row.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{rateNote}</p>

        <div className="mt-10 rounded-lg border border-border bg-card p-6">
          <h2 className="text-base font-medium">{faqQuestion}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faqAnswer}</p>
        </div>

        <div className="mt-10 flex flex-col items-start gap-3 rounded-lg border border-border bg-card p-6">
          <h2 className="text-base font-medium">
            Compare {courierName} against Pathao, RedX, CarryBee, and Steadfast in one place
          </h2>
          <p className="text-sm text-muted-foreground">
            {SITE_NAME} runs all four calculators at once and highlights the cheapest option for your exact route and
            weight — free, no sign-up.
          </p>
          <Link href="/" className={buttonVariants({ variant: "default" })}>
            Open the full calculator
          </Link>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
