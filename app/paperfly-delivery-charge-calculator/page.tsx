import { CourierLanding } from "@/components/courier-landing";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Paperfly Delivery Charge Calculator",
  description:
    "Calculate Paperfly delivery charges for Same City, Periphery/Suburb, and Rest of Bangladesh routes by weight, including COD fee — free, instant, no sign-up.",
  path: "/paperfly-delivery-charge-calculator",
});

export default function PaperflyPage() {
  return (
    <CourierLanding
      courierName="Paperfly"
      path="/paperfly-delivery-charge-calculator"
      tagline="Paperfly's real zone-based rates, explained."
      intro="Paperfly prices every delivery into one of three zones — Same City (the merchant's own metro or Sadar area), Periphery/Suburb, or Rest of Bangladesh — then bills a flat base for the first kg plus a per-kg rate above it, the same ৳20/kg across every zone. An exchange or partial-delivery order adds half the delivery charge on top."
      rateRows={[
        { zone: "Same City (pickup = delivery city)", rate: "৳70 up to 1kg · +৳20/kg after · 0% COD" },
        { zone: "Periphery / Suburb (Dhaka-adjacent belt)", rate: "৳110 up to 1kg · +৳20/kg after · 1% COD" },
        { zone: "Rest of Bangladesh (everywhere else)", rate: "৳130 up to 1kg · +৳20/kg after · 1% COD" },
      ]}
      rateNote="Rates sourced directly from Paperfly's own published charges page (paperfly.com.bd/charges/). All prices already include VAT and tax, there is no separate return charge, and the weight ceiling is 8kg. COD is charged on the full collected amount (product price plus any delivery charge passed to the customer). Weight rounds up to the next whole kg, first kg included in the base — standard courier volumetric practice, though not spelled out on Paperfly's own page."
      faqQuestion="Does Paperfly charge extra for an exchange or partial delivery?"
      faqAnswer="Yes — an exchange or partial-delivery order adds 50% of the normal forward delivery charge on top of the base delivery fee, per Paperfly's published rate card. A 1kg Periphery delivery, for example, costs ৳110 normally but ৳165 as an exchange, before any COD fee."
    />
  );
}
