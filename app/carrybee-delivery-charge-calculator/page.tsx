import { CourierLanding } from "@/components/courier-landing";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "CarryBee Delivery Charge Calculator",
  description:
    "Calculate CarryBee delivery charges for same-city, Dhaka-suburb, and cross-district routes by weight — free, instant, no sign-up.",
  path: "/carrybee-delivery-charge-calculator",
});

export default function CarryBeePage() {
  return (
    <CourierLanding
      courierName="CarryBee"
      path="/carrybee-delivery-charge-calculator"
      tagline="CarryBee's real zone and weight-bucket rates, explained."
      intro="CarryBee bills in fine weight buckets up to 3kg (every 0.2–0.5kg step has its own flat price), then switches to a flat 4kg rate plus a per-kg surcharge above that. Its zone logic treats Gazipur and Narayanganj as Dhaka's suburb — every other district is priced as a full outside-Dhaka route."
      rateRows={[
        { zone: "Same City (pickup = delivery city)", rate: "৳49 up to 0.2kg · ৳70 up to 1kg · ৳110 up to 3kg · ৳130 at 4kg · +৳20/kg after" },
        { zone: "Dhaka → Suburb (Gazipur, Narayanganj)", rate: "৳80 up to 0.2kg · ৳100 up to 1kg · ৳150 up to 3kg · ৳170 at 4kg · +৳20/kg after" },
        { zone: "Dhaka → other district", rate: "৳99 up to 0.2kg · ৳125 up to 1kg · ৳170 up to 3kg · ৳195 at 4kg · +৳25/kg after" },
        { zone: "Other district → Dhaka", rate: "৳99 up to 0.2kg · ৳110 up to 1kg · ৳160 up to 3kg · ৳185 at 4kg · +৳25/kg after" },
        { zone: "District → district (neither is Dhaka)", rate: "৳125 up to 0.2kg · ৳135 up to 1kg · ৳170 up to 3kg · ৳195 at 4kg · +৳25/kg after" },
      ]}
      rateNote="Rates verified against CarryBee's own live rate-calculator endpoint (200 randomized calls, zero mismatches at time of writing). CarryBee's endpoint returns delivery fee only — its COD fee shown elsewhere in this comparison is an industry-standard estimate (1%), not independently confirmed."
      faqQuestion="Does CarryBee charge more outside Dhaka?"
      faqAnswer="Yes. A same-city CarryBee delivery starts at ৳49 for a very light parcel, while any route touching a district outside the Dhaka-Gazipur-Narayanganj cluster starts at ৳99–125 depending on direction, before weight is even factored in."
    />
  );
}
