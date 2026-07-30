import type { Metadata } from "next";

import { CourierLanding } from "@/components/courier-landing";

export const metadata: Metadata = {
  title: "Steadfast Courier Charge Calculator",
  description:
    "Calculate Steadfast Courier delivery charges for same-district-Dhaka, Dhaka-to-Sub-Urban, and cross-district routes by weight — free, instant, no sign-up.",
  alternates: { canonical: "/steadfast-courier-charge-calculator" },
};

export default function SteadfastPage() {
  return (
    <CourierLanding
      courierName="Steadfast"
      headingSuffix="courier charge calculator"
      tagline="Steadfast's real district-pair rates, explained."
      intro="Steadfast prices real district-to-district routes rather than a handful of broad zones, and Dhaka City-to-Dhaka City routes get extra fine-grained weight tiers (150g and 500g) that no other route qualifies for. Every other route bills in whole-kg steps."
      rateRows={[
        { zone: "Dhaka City → Dhaka City, up to 150g", rate: "৳55 flat" },
        { zone: "Dhaka City → Dhaka City, up to 500g", rate: "৳65 flat" },
        { zone: "Dhaka City → Dhaka City, over 500g", rate: "৳75 base · +৳20/kg after" },
        { zone: "Dhaka City → Sub-Urban district", rate: "৳105 up to 500g · +৳20/kg after" },
        { zone: "Dhaka City → other district", rate: "৳115 up to 500g, ৳135 above · +৳20/kg after" },
        { zone: "Other district → Dhaka City", rate: "৳115 base · +৳20/kg after" },
        { zone: "Other district → other district", rate: "৳135 base · +৳20/kg after" },
      ]}
      rateNote="Regular parcel rates shown; Document and Book categories bill differently (flat ৳55 for documents). COD fee is 1% of the collected amount. Rates reverse-engineered from Steadfast's own pricing data and Vue calculator component."
      faqQuestion="Is Steadfast cheaper for deliveries within Dhaka City?"
      faqAnswer="Yes — a Dhaka City-to-Dhaka City delivery under 150g bills at just ৳55, the cheapest tier Steadfast offers, versus ৳115+ for any route touching a district outside Dhaka."
    />
  );
}
