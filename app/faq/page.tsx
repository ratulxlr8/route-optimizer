import type { Metadata } from "next";

import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingNav } from "@/components/marketing-nav";
import { NAME_VARIANTS, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ — Courier Charge Calculator Questions",
  description:
    "Common questions about FleetSplit: which couriers it compares, whether it's free, how the rates are sourced, and how bulk order auto-splitting works.",
  alternates: { canonical: "/faq" },
};

const FAQ_ITEMS: Array<{ question: string; answer: string }> = [
  {
    question: `What is ${SITE_NAME}?`,
    answer:
      "FleetSplit is a free courier charge calculator for Bangladeshi e-commerce and F-commerce sellers. Enter a pickup zone, delivery zone, parcel weight, and price, and it instantly shows what Pathao, RedX, CarryBee, and Steadfast would each charge for that delivery, side by side, with the cheapest option highlighted.",
  },
  {
    question: "Is FleetSplit free to use?",
    answer:
      "Yes. There is no sign-up, no account, and no fee. FleetSplit runs entirely in your browser — every calculation happens on your device, nothing is sent to a server.",
  },
  {
    question: "Which couriers does FleetSplit compare?",
    answer:
      "Pathao, RedX, CarryBee, and Steadfast — the four most widely used courier services for e-commerce delivery in Bangladesh. Each courier's rate table, weight tiers, and zone logic are modeled separately, since every courier prices routes differently.",
  },
  {
    question: "How accurate are the courier rates shown?",
    answer:
      "The rate tables are reverse-engineered directly from each courier's own live rate calculator, not estimated. They are static snapshots rather than a live integration, so always confirm the final charge with the courier before dispatch — a courier can revise its published rates at any time.",
  },
  {
    question: 'What does "auto-split" mean for bulk orders?',
    answer:
      "Upload a CSV or Excel file of orders in the Bulk Upload tab, and FleetSplit calculates every courier's charge for every row, then assigns each individual order to whichever courier is cheapest for that specific order — rather than locking your whole batch into one courier. You can then export the results as CSV or Excel.",
  },
  {
    question: "Does FleetSplit store my order data or share it with couriers?",
    answer:
      "No. FleetSplit has no backend and no database — it's a static, client-side calculator. Your pickup/delivery zones, weights, and prices are never uploaded anywhere; they only exist in your browser tab while you're using the page.",
  },
  {
    question: "Is FleetSplit available in Bangla?",
    answer:
      "Yes — use the language toggle in the header to switch the interface between English and বাংলা at any time.",
  },
  {
    question: "Can I install FleetSplit like an app?",
    answer:
      "Yes. FleetSplit is a Progressive Web App — on Chrome or Edge, use the browser's \"Install\" option (or \"Add to Home Screen\" on mobile) to add it to your device and open it like a native app, including basic offline access to the page shell.",
  },
  {
    question: "I searched for this tool with a different spelling — is this the right site?",
    answer: `Yes. This tool is officially called "${SITE_NAME}", but is also commonly searched as ${NAME_VARIANTS.join(", ")} — all of these refer to the same free courier charge calculator.`,
  },
];

export default function FaqPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <div className="app-canvas flex min-h-full flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <MarketingNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Frequently asked questions</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Everything merchants ask before comparing Pathao, RedX, CarryBee, and Steadfast rates on {SITE_NAME}.
        </p>
        <dl className="mt-8 flex flex-col gap-8">
          {FAQ_ITEMS.map((item) => (
            <div key={item.question} className="border-b border-border pb-8 last:border-0">
              <dt className="text-base font-medium">{item.question}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </main>
      <MarketingFooter />
    </div>
  );
}
