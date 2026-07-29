# Smart Courier Auto-Splitter

A real-time shipping rate calculator for Bangladeshi F-commerce/e-commerce merchants. Enter one order (delivery zone, weight, price, COD) — or bulk-upload a CSV or Excel file of orders — and instantly compare **Pathao**, **RedX**, **CarryBee**, and **Steadfast** rates side by side, with the cheapest option highlighted.

See [`redme.md`](./redme.md) for the original product spec and pricing rules this app implements.

## Stack

Next.js (App Router, TypeScript) · Tailwind CSS v4 · shadcn/ui · lucide-react · [`write-excel-file`](https://www.npmjs.com/package/write-excel-file) / [`read-excel-file`](https://www.npmjs.com/package/read-excel-file) for the Excel template + upload (chosen over the more common `xlsx`/`exceljs` packages, which both carry unpatched high-severity CVEs in their npm-published versions — these two don't)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

- `lib/courierCalculators.ts` — pricing engine: `calculatePathao`, `calculateRedX`, `calculateCarryBee`, `calculateSteadfast`, and `getAllQuotes`. Pickup and delivery are both real district ids in this app's *canonical* id space (see `lib/districts.ts`); every courier prices the real district pair directly, each translating the canonical id into its own courier-specific numbering first (`CANONICAL_DISTRICT` / `resolvePathaoDistrictId` / `resolveSteadfastDistrictId` / `redxZoneId`).
- `lib/pathaoPricing.ts` — Pathao's real metro-zone + weight-tier engine and own district list, reverse-engineered from their live price calculator.
- `lib/carrybeePricing.ts` — CarryBee's real zone + weight-bucket engine, reverse-engineered from their live rate-calculator API.
- `lib/steadfastPricing.ts` — Steadfast's real weight-tier + zone engine and own district list, reverse-engineered from their Vue calculator component and pricing-data endpoint.
- `lib/redxPricing.ts` — RedX's real route-classification + weight-rounding engine, reverse-engineered from their homepage calculator's network calls.
- `lib/districts.ts` — this app's canonical 64+1 district list (id + name), used by the Pickup/Delivery selectors.
- `lib/bulkOrders.ts` — CSV and Excel (`.xlsx`) parsing and auto-split aggregation for the bulk upload tab (client-side only, no upload endpoint; both formats share the same row-validation logic).
- `lib/i18n.ts` — English/Bangla dictionaries for all UI copy. District names and the pricing engine's generated strings (zone labels, slab notes, parse errors) stay in English in both languages — they're place names and data from `lib/*Pricing.ts`, not chrome, and the courier resolvers match on those exact names.
- `lib/language-store.ts` — `useSyncExternalStore`-based language store (`useLanguage()` → `{ lang, setLang, t }`), persisted to `localStorage` and mirrored onto `<html lang>`.
- **Typography.** `--font-sans` and `--font-mono` (see `app/globals.css`) are *composed stacks*, not per-language swaps: Inter → Noto Serif Bengali, and Geist Mono → Noto Serif Bengali. CSS font fallback is per-glyph, so Latin resolves from Inter/Geist Mono and Bengali from Noto Serif Bengali in both languages. This is why "RedX" looks identical in English and বাংলা, why the বাংলা toggle label renders correctly while the UI is in English, and why `৳` (U+09F3 — absent from Geist Mono) has a chosen font rather than an arbitrary system fallback. The one `lang`-dependent rule is `:lang(bn) .micro`, which drops small labels out of mono because Geist Mono's space advance opens a visible gap between Bengali words. Noto Serif Bengali is loaded via `next/font/google` (self-hosted at build, no `fonts.googleapis.com` request) rather than a `<link>` tag.
- `app/page.tsx` — the order form + results dashboard, with Single Order / Bulk Upload tabs. Results are a hero "best pick" panel plus a ranked comparison list; each row's bar is scaled across the [cheapest, priciest] range rather than from zero (see `barPct`), since courier rates cluster closely and zero-based bars all render nearly full.
- `components/bulk-upload.tsx` — the bulk upload UI (drag-and-drop, template download, results table, CSV + Excel export).

**Important: every courier uses its own, unrelated district numbering.** The canonical list in `lib/districts.ts` holds CarryBee's real ids (Dhaka = 14) — Pathao, Steadfast, and RedX each have entirely different numbering for the same 64 districts (e.g. Steadfast's Dhaka City = 1, Gazipur = 14; Pathao's Dhaka = 1, Gazipur = 22). The UI shows one shared district list by name; `resolvePathaoDistrictId`/`resolveSteadfastDistrictId` translate a canonical name into each courier's own id (bridging ~10 known spelling differences per courier, e.g. "Chattogram" vs "Chittagong"/"Chittagong"). The canonical list also has a synthetic `DHAKA_SUBURB_PSEUDO_ID` entry ("Dhaka Sub-Urban") that isn't a real id from any courier's API except Steadfast's (which has a real, distinct Dhaka Sub-Urban district) — CarryBee and Pathao substitute it with a real representative (Gazipur) when priced.

**Note on pricing data — all four couriers are now real, reverse-engineered from each one's own live calculator (not estimates):**
- **Pathao**: metro-group zone logic (Dhaka/Narayanganj/Gazipur), weight-bucket rates for Normal + Document + Same Day, and its own district list. One inconsistency in the source spec, resolved in favor of its own explicit callout rather than its literal code: Same Day's base-fare boundary is 1.5kg (not the 1kg boundary the given code's generic tier-lookup would otherwise apply), so a 1.5kg Same Day parcel correctly bills at the lower tier instead of jumping to the next one early.
- **CarryBee**: zone logic + weight-bucket rates reverse-engineered from their live rate-calculator endpoint (200 randomized calls, zero mismatches).
- **Steadfast**: weight-tier rules (which differ by route — Dhaka City ↔ itself gets extra tiers other routes don't), zone logic, all 22 rate figures, and its own district list (648 input combinations, zero mismatches). Two live bugs on Steadfast's own site are handled explicitly rather than copied: Book + same-district + >1kg references a rate key (`isd_to_isd_weight`) missing from their payload (defaulted to 20, the obvious intent); Document category silently reprices at Regular above 0.2kg while still showing the "Document" label (surfaced via `categoryDowngraded`/`warning` in `computeSteadfastCharge`, though the shared UI doesn't expose a category selector yet).
- **RedX**: rate table, weight-rounding rule (whole-kg up to 5kg, exact fractional above), and route classification, verified against documented fixtures. One real gap: RedX's actual classification runs on ~2,838 individual *areas* (each with its own zone + district), not districts — no area-tree data was available, so `lib/redxPricing.ts` approximates zoneId from a district-level bucketing (same Dhaka/Gazipur/Narayanganj/Munshiganj/Manikganj/Narsingdi set Pathao's metro-adjacent logic doesn't use, since RedX's confirmed real definition is narrower — see below). This reproduces RedX's real quirks correctly at district granularity (same-district-different-zone still gets the cheap rate; different-district-same-zone doesn't), but can't reproduce a single district whose real areas actually split across two zones (most likely Dhaka district itself).
- **COD fees**: Pathao's, Steadfast's, and RedX's are all real (1%, each courier's own live API/published fine print). CarryBee's is still an estimate (1%, industry norm) since its live endpoint only returns the delivery fee.
- The **Suburbs** bucket (used only for bulk CSV rows now, see below) is CarryBee's confirmed real definition (Gazipur + Narayanganj only) — RedX's real zone-2 definition isn't confirmed district-by-district, so its district-level approximation reuses this same set plus Munshiganj/Manikganj/Narsingdi for broader coverage.

`lib/pathaoPricing.ts`, `lib/carrybeePricing.ts`, `lib/steadfastPricing.ts`, and `lib/redxPricing.ts` are all static snapshots, not live integrations — this app's calculations are otherwise all client-side/offline, and all four endpoints are undocumented, so re-probe and update those files if any courier revises rates.

Bulk CSV rows still only carry a generic zone (Inside Dhaka / Suburbs / Outside Dhaka), not a real district pair, since the CSV format doesn't have per-row pickup/delivery district columns — `genericLocationFromDistrict` / `REPRESENTATIVE_DISTRICT_FOR_GENERIC` convert between that generic zone and a stand-in real district for bulk calculations only. Single-order pricing no longer uses this at all.
