import Link from "next/link";

import { SITE_NAME } from "@/lib/site";

/**
 * Shared header for the static content pages (FAQ, About, courier landing
 * pages) — deliberately separate from app/page.tsx's own header, which is
 * the calculator's app-shell chrome (language/theme toggles, tabs) and
 * shouldn't grow marketing nav concerns.
 */
export function MarketingNav() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- static export, no next/image loader configured */}
          <img src="/logo-mark.png" alt="" width={217} height={200} className="h-7 w-auto" />
          <span className="text-sm font-medium tracking-tight">{SITE_NAME}</span>
        </Link>
        <nav className="flex items-center gap-4 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Calculator
          </Link>
          <Link href="/faq" className="hover:text-foreground">
            FAQ
          </Link>
          <Link href="/about" className="hover:text-foreground">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
