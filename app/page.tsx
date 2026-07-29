"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Boxes, Package } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxTrigger,
  ComboboxValue,
} from "@/components/ui/combobox";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsTab,
} from "@/components/ui/tabs";
import { BulkUpload } from "@/components/bulk-upload";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  COURIER_BAR,
  COURIER_DOT,
  CANONICAL_DISTRICT,
  type CourierResult,
  genericLocationFromDistrict,
  getAllQuotes,
} from "@/lib/courierCalculators";
import { BANGLADESH_DISTRICTS } from "@/lib/districts";
import { useLanguage } from "@/lib/language-store";
import { formatBDT } from "@/lib/utils";

// Bangladesh's flag, simplified to a mark: green field, red disc offset
// toward the hoist so it still reads correctly when mirrored/cropped small.
function BangladeshFlagMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 12" className={className} aria-hidden="true">
      <rect width="20" height="12" fill="var(--primary)" />
      <circle cx="8.5" cy="6" r="3.6" fill="var(--flag-red)" />
    </svg>
  );
}

/** Combobox items, built once at module scope. The identity of each object has
 *  to be stable across renders: Base UI compares the selected value against
 *  `items` with `Object.is` by default, so rebuilding this per render would
 *  break the checkmark and the trigger label. The `{ value, label }` shape is
 *  the one Base UI derives display text and filtering from automatically. */
const DISTRICT_ITEMS = BANGLADESH_DISTRICTS.map((district) => ({
  value: String(district.id),
  label: district.name,
}));

/** A searchable district picker — 64 districts is far too many to scan, so the
 *  popup filters as you type. Both Pickup and Delivery are the same control,
 *  stacked label-over-trigger (like the Weight/Price fields below) so it
 *  holds up at half width in the two-column Pickup/Delivery row. */
function DistrictField({
  id,
  label,
  value,
  onChange,
  searchPlaceholder,
  emptyMessage,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (id: number) => void;
  searchPlaceholder: string;
  emptyMessage: string;
}) {
  const selected = DISTRICT_ITEMS.find((item) => item.value === String(value)) ?? null;

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Combobox
        items={DISTRICT_ITEMS}
        value={selected}
        autoHighlight
        onValueChange={(next) => {
          // `multiple` is off, so this is a single item — but the callback's
          // type still admits an array.
          const item = Array.isArray(next) ? next[0] : next;
          if (item) onChange(Number(item.value));
        }}
      >
        {/* title: a plain hover tooltip for when the half-width column
            truncates a long name ("Chapainawabganj", "Dhaka Sub-Urban") —
            the closed trigger has no other way to reveal the full value. */}
        <ComboboxTrigger id={id} title={selected?.label} className="w-full">
          <ComboboxValue />
        </ComboboxTrigger>
        <ComboboxContent
          searchPlaceholder={searchPlaceholder}
          emptyMessage={emptyMessage}
        >
          {(item: (typeof DISTRICT_ITEMS)[number]) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

/** One line of the comparison ledger. These are rows in a single divided
 *  container rather than individual floating cards — four identically styled
 *  cards read as filler, whereas a ruled list reads as a rate sheet. */
function CourierRow({
  quote,
  rank,
  widthPct,
  delta,
  breakdown,
  cheapestLabel,
}: {
  quote: CourierResult;
  rank: number;
  widthPct: number;
  delta: number;
  breakdown: string;
  cheapestLabel: string;
}) {
  const isWinner = rank === 1;

  return (
    <div
      title={breakdown}
      className="elevate-hover relative flex items-center gap-3 py-2 pr-3 pl-4 hover:bg-secondary/70 sm:gap-4 sm:py-2.5 sm:pr-4"
    >
      {/* A rule on the leading edge marks the winner instead of tinting the
          whole row — keeps the list surface uniform and quiet. */}
      {isWinner && (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-[3px] bg-primary dark:bg-ring"
        />
      )}
      <span
        className={`numeric w-3 shrink-0 text-xs ${
          isWinner ? "text-primary dark:text-ring" : "text-muted-foreground/70"
        }`}
      >
        {rank}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className={`size-1.5 shrink-0 rounded-full ${COURIER_DOT[quote.courier]}`} />
          {/* No min-w-0 rescue here on purpose: with `truncate`'s overflow:
              hidden, a flex child's automatic min-width becomes 0, so without
              a floor the name — the one thing in this row that must stay
              legible — was shrinking below "RedX" to fit the zone label
              beside it. min-w-[3.5rem] gives the name a floor before it's
              allowed to give up space to anything else. */}
          <span className="min-w-14 truncate text-sm font-medium">{quote.courier}</span>
          {isWinner && (
            <span className="micro shrink-0 text-primary dark:text-ring">
              {cheapestLabel}
            </span>
          )}
          {/* A place name, not a figure — stays in the sans face. Dropped
              below `sm` entirely rather than fighting the name for space; it
              reappears on its own line under the bar instead. */}
          <span className="hidden truncate text-xs text-muted-foreground sm:inline">
            {quote.zoneLabel}
          </span>
        </div>
        {/* Squared, hairline-thin bar. Width comes from the caller's range
            scale (see `barPct`), so a shorter bar means a cheaper courier. */}
        <div className="mt-1.5 h-[3px] bg-muted">
          <div
            className={`h-full transition-[width] duration-500 ease-out ${COURIER_BAR[quote.courier]}`}
            style={{ width: `${widthPct}%` }}
          />
        </div>
        <p className="mt-1 truncate text-xs text-muted-foreground sm:hidden">
          {quote.zoneLabel}
        </p>
      </div>

      <div className="flex shrink-0 items-baseline gap-3">
        <span className="numeric text-sm font-medium">
          {formatBDT(quote.totalCharge)}
        </span>
        <span
          className={`numeric w-12 text-right text-xs ${
            isWinner ? "text-primary dark:text-ring" : "text-muted-foreground"
          }`}
        >
          {delta > 0 ? `+${formatBDT(delta)}` : "—"}
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  const { t } = useLanguage();
  const [pickupDistrictId, setPickupDistrictId] = useState<number>(
    CANONICAL_DISTRICT.DHAKA,
  );
  const [deliveryDistrictId, setDeliveryDistrictId] = useState<number>(
    CANONICAL_DISTRICT.DHAKA,
  );
  const [weightKg, setWeightKg] = useState("0.5");
  const [productPrice, setProductPrice] = useState("1200");
  const [isCOD, setIsCOD] = useState(true);

  const weight = Math.max(0, Number(weightKg) || 0);
  const price = Math.max(0, Number(productPrice) || 0);

  const quotes = useMemo(
    () =>
      weight > 0
        ? getAllQuotes({
            location: genericLocationFromDistrict(deliveryDistrictId),
            pickupDistrictId,
            deliveryDistrictId,
            weightKg: weight,
            productPrice: price,
            isCOD,
          })
        : [],
    [deliveryDistrictId, pickupDistrictId, weight, price, isCOD],
  );

  const cheapest = quotes[0];
  const priciest = quotes[quotes.length - 1];
  const savings = cheapest && priciest ? priciest.totalCharge - cheapest.totalCharge : 0;
  const savingsPct =
    priciest && priciest.totalCharge > 0 ? (savings / priciest.totalCharge) * 100 : 0;
  // Bars are scaled across the [cheapest, priciest] range rather than from
  // zero: courier rates sit close together (often within 20%), so zero-based
  // bars all render nearly full and the ranking becomes invisible. Cheapest
  // gets the shortest bar, priciest a full one — the exact taka figures sit
  // right beside each bar, so the amplified scale can't mislead.
  const barPct = (total: number) => {
    if (!cheapest || !priciest) return 0;
    const range = priciest.totalCharge - cheapest.totalCharge;
    if (range <= 0) return 100;
    return 30 + 70 * ((total - cheapest.totalCharge) / range);
  };

  // The per-fee split is secondary to the comparison, so it rides along as the
  // row's tooltip rather than taking up a third line in every row.
  const feeBreakdown = (quote: CourierResult) =>
    [
      `${t.baseCharge} ${formatBDT(quote.baseCharge)}`,
      quote.overageCharge > 0 ? `${t.overage} ${formatBDT(quote.overageCharge)}` : null,
      quote.codCharge > 0 ? `${t.codFee} ${formatBDT(quote.codCharge)}` : null,
    ]
      .filter((part) => part !== null)
      .join(" · ");

  return (
    <div className="app-canvas flex flex-1 flex-col">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
          <div className="flex items-baseline gap-2.5">
            <BangladeshFlagMark className="h-3 w-auto translate-y-px" />
            <h1 className="text-sm font-medium tracking-tight">{t.appName}</h1>
            {/* Prose, so it stays in the sans face — the mono treatment is
                reserved for labels and figures. */}
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {t.tagline}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-3 sm:px-6 sm:py-4">
        <Tabs defaultValue="single">
          <TabsList>
            <TabsIndicator />
            <TabsTab value="single">
              <Package /> {t.tabSingle}
            </TabsTab>
            <TabsTab value="bulk">
              <Boxes /> {t.tabBulk}
            </TabsTab>
          </TabsList>

          <TabsPanel
            value="single"
            className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-[19rem_1fr]"
          >
            {/* Form. One panel, sections separated by hairline rules rather
                than nested boxes — boxes inside boxes is the look we're
                deliberately avoiding. */}
            <section className="elevate h-fit divide-y divide-border rounded-md border border-border bg-card lg:sticky lg:top-6">
              {/* `items-end` lines the arrow up with the trigger row, not
                  the label row above it: DistrictField is itself a two-row
                  flex-col (label, then trigger), so aligning the whole grid
                  row to its end edge puts this h-9 arrow box flush against
                  the same bottom edge the triggers end on — no manual
                  offset needed to center it on the fields. */}
              <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2 p-3 sm:p-3.5">
                <DistrictField
                  id="pickup"
                  label={t.pickupLabel}
                  value={pickupDistrictId}
                  onChange={setPickupDistrictId}
                  searchPlaceholder={t.searchDistrict}
                  emptyMessage={t.noDistrictFound}
                />
                <div className="flex h-9 items-center justify-center text-muted-foreground/50">
                  <ArrowRight className="size-3.5" />
                </div>
                <DistrictField
                  id="delivery"
                  label={t.deliveryLabel}
                  value={deliveryDistrictId}
                  onChange={setDeliveryDistrictId}
                  searchPlaceholder={t.searchDistrict}
                  emptyMessage={t.noDistrictFound}
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5 p-3 sm:p-3.5">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="weight" className="text-xs text-muted-foreground">
                    {t.weightLabel}
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    min="0.1"
                    step="0.1"
                    className="numeric"
                    value={weightKg}
                    onChange={(event) => setWeightKg(event.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="price" className="text-xs text-muted-foreground">
                    {t.priceLabel}
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="10"
                    className="numeric"
                    value={productPrice}
                    onChange={(event) => setProductPrice(event.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 p-3 sm:p-3.5">
                <div className="min-w-0">
                  <Label htmlFor="cod" className="text-xs font-medium">
                    {t.codLabel}
                  </Label>
                  <p className="mt-0.5 text-[0.6875rem] text-muted-foreground">
                    {t.codHelp}
                  </p>
                </div>
                <Switch id="cod" checked={isCOD} onCheckedChange={setIsCOD} />
              </div>
            </section>

            <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
              {!cheapest && (
                <div className="elevate rounded-md border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
                  {t.emptyState}
                </div>
              )}

              {cheapest && (
                <>
                  {/* Hero. Flat single colour, no gradient and no blurred
                      corner glow: both are template signatures. The weight
                      comes from the type — a large mono figure against a
                      quiet green field. */}
                  <section className="animate-in fade-in fill-mode-both rounded-md bg-hero px-4 py-3.5 text-white duration-300 sm:px-6 sm:py-5">
                    <div className="flex items-start justify-between gap-4">
                      <span className="micro text-gold">{t.bestPick}</span>
                      <span className="micro text-white/55">{t.total}</span>
                    </div>
                    {/* Side by side at every width, not stacked: delivery
                        fees here top out in the low thousands of taka, so the
                        total never grows wide enough to actually contest the
                        courier name for space (checked against the tightest
                        real case — an Outside Dhaka, heavy-parcel route).
                        `min-w-0` + `truncate` is the real guard if that
                        assumption is ever wrong. */}
                    <div className="mt-1 flex items-end justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-[1.75rem] leading-none font-medium tracking-tight sm:text-3xl">
                          {cheapest.courier}
                        </div>
                        <div className="mt-1.5 line-clamp-2 text-xs text-white/60 sm:truncate">
                          {cheapest.zoneLabel} · {cheapest.slabNote}
                        </div>
                      </div>
                      <div className="numeric shrink-0 text-[2.75rem] leading-none font-medium sm:text-5xl">
                        {formatBDT(cheapest.totalCharge)}
                      </div>
                    </div>
                    {savings > 0 && (
                      <div className="mt-4 border-t border-white/15 pt-2.5 text-xs text-white/70">
                        {t.youSave}{" "}
                        <span className="numeric text-white">{formatBDT(savings)}</span>{" "}
                        <span className="text-white/50">
                          ({savingsPct.toFixed(0)}%)
                        </span>{" "}
                        {t.vsCourier(priciest.courier)}
                      </div>
                    )}
                  </section>

                  <section>
                    <div className="mb-2 flex items-baseline justify-between">
                      <h2 className="text-xs font-medium text-muted-foreground">
                        {t.allCouriers}
                      </h2>
                      <span className="micro text-muted-foreground/70">
                        {quotes.length}
                      </span>
                    </div>
                    <div className="elevate divide-y divide-border overflow-hidden rounded-md border border-border bg-card">
                      {quotes.map((quote, index) => (
                        <CourierRow
                          key={quote.courier}
                          quote={quote}
                          rank={index + 1}
                          widthPct={barPct(quote.totalCharge)}
                          delta={quote.totalCharge - cheapest.totalCharge}
                          breakdown={feeBreakdown(quote)}
                          cheapestLabel={t.cheapestBadge}
                        />
                      ))}
                    </div>
                  </section>
                </>
              )}
            </div>
          </TabsPanel>

          <TabsPanel value="bulk">
            <BulkUpload />
          </TabsPanel>
        </Tabs>
      </main>
    </div>
  );
}
