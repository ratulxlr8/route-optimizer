import Link from "next/link";

import { SITE_NAME } from "@/lib/site";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-8 text-xs text-muted-foreground sm:px-6">
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <Link href="/pathao-delivery-charge-calculator" className="hover:text-foreground">
            Pathao charge calculator
          </Link>
          <Link href="/redx-delivery-charge-calculator" className="hover:text-foreground">
            RedX charge calculator
          </Link>
          <Link href="/steadfast-courier-charge-calculator" className="hover:text-foreground">
            Steadfast charge calculator
          </Link>
          <Link href="/carrybee-delivery-charge-calculator" className="hover:text-foreground">
            CarryBee charge calculator
          </Link>
        </div>
        <p>
          © {new Date().getFullYear()} {SITE_NAME}. Independent price comparison tool — not affiliated with Pathao,
          RedX, CarryBee, or Steadfast.
        </p>
      </div>
    </footer>
  );
}
