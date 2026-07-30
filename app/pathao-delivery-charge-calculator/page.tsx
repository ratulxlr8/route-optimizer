import type { Metadata } from "next";

import { CourierLanding } from "@/components/courier-landing";

export const metadata: Metadata = {
  title: "Pathao Delivery Charge Calculator",
  description:
    "Calculate Pathao Courier delivery charges for Same City, Sub-City, Inter-City, and Outside City routes by weight — free, instant, no sign-up.",
  alternates: { canonical: "/pathao-delivery-charge-calculator" },
};

export default function PathaoPage() {
  return (
    <CourierLanding
      courierName="Pathao"
      tagline="Pathao Courier's real weight-tier and zone rates, explained."
      intro="Pathao doesn't price by distance — it resolves a route into one of four zones based on whether the pickup and delivery cities sit inside Dhaka's metro group (Dhaka, Narayanganj, Gazipur), then charges a flat base fare by weight bucket plus a per-kg surcharge above 2kg."
      rateRows={[
        { zone: "Same City (pickup = delivery city)", rate: "৳60 up to 0.5kg · ৳70 up to 1kg · ৳90 up to 2kg · +৳15/kg after" },
        { zone: "Sub-City (both cities in Dhaka/Narayanganj/Gazipur)", rate: "৳80 up to 0.5kg · ৳100 up to 1kg · ৳130 up to 2kg · +৳25/kg after" },
        { zone: "Inter-City (one city in the metro group)", rate: "৳110 up to 0.5kg · ৳130 up to 1kg · ৳170 up to 2kg · +৳25/kg after" },
        { zone: "Outside City (neither city in the metro group)", rate: "৳120 up to 0.5kg · ৳145 up to 1kg · ৳180 up to 2kg · +৳25/kg after" },
      ]}
      rateNote="Parcel rates shown; Document and Same Day Delivery use separate tables. COD fee is 1% of the collected amount. Rates reverse-engineered from Pathao's own live calculator — always confirm with Pathao before dispatch."
      faqQuestion="How much does Pathao charge for a 1kg parcel inside the same city?"
      faqAnswer="৳70 for a Same City parcel up to 1kg (Pathao's own Same City tier covers up to 1kg at that flat rate, stepping up to ৳90 at 2kg, then +৳15 per additional kg)."
    />
  );
}
