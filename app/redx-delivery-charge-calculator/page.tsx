import { CourierLanding } from "@/components/courier-landing";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "RedX Delivery Charge Calculator",
  description:
    "Calculate RedX delivery charges for Inside City, Dhaka Suburb, and Outside Dhaka routes by weight, including COD fee — free, instant, no sign-up.",
  path: "/redx-delivery-charge-calculator",
});

export default function RedxPage() {
  return (
    <CourierLanding
      courierName="RedX"
      path="/redx-delivery-charge-calculator"
      tagline="RedX's real inside-city, suburb, and outside-Dhaka rates, explained."
      intro="RedX classifies every delivery into one of three tiers — inside the same city, the Dhaka-adjacent suburb belt (Gazipur, Narayanganj, Munshiganj), or outside Dhaka entirely — then bills a flat base for the first kg plus a per-kg rate above it. Weight rounds up to the next whole kg up to 5kg; above 5kg the exact fractional weight is billed instead."
      rateRows={[
        { zone: "Inside City (same city pickup and delivery)", rate: "৳65 base (1kg) · +৳15/kg after · 0% COD" },
        { zone: "Dhaka Suburb (Gazipur, Narayanganj, Munshiganj)", rate: "৳90 base (1kg) · +৳15/kg after · 1% COD" },
        { zone: "Outside Dhaka (everywhere else)", rate: "৳120 base (1kg) · +৳30/kg after · 1% COD" },
      ]}
      rateNote="Rates verified against RedX's own live charge-calculator API and cross-checked against RedX's published area-rate sheet. RedX's real classification runs on individual delivery areas, not whole districts, so a route right at a zone boundary may occasionally differ from this district-level estimate."
      faqQuestion="Does RedX charge extra for Cash on Delivery (COD)?"
      faqAnswer="Inside-city deliveries have no COD fee. Dhaka Suburb and Outside Dhaka deliveries carry a 1% COD fee on the collected amount, per RedX's own published rate structure."
    />
  );
}
