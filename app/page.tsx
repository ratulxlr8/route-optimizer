"use client";

import { useMemo, useState } from "react";
import {
  Banknote,
  Crown,
  Sparkles,
  Weight as WeightIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
  COURIER_DOT,
  CANONICAL_DISTRICT,
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
      <rect width="20" height="12" rx="1.5" fill="var(--primary)" />
      <circle cx="8.5" cy="6" r="3.6" fill="var(--flag-red)" />
    </svg>
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

  return (
    <div className="flex flex-1 flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 sm:px-8">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <BangladeshFlagMark className="h-3 w-auto rounded-xs ring-1 ring-black/10 dark:ring-white/15" />
              {t.appName}
            </div>
            <h1 className="text-lg font-semibold tracking-[-0.02em] sm:text-xl">
              {t.tagline}
            </h1>
          </div>
          <div className="flex items-center gap-1">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-4 sm:px-8">
        <Tabs defaultValue="single">
          <TabsList>
            <TabsIndicator />
            <TabsTab value="single">{t.tabSingle}</TabsTab>
            <TabsTab value="bulk">{t.tabBulk}</TabsTab>
          </TabsList>

          <TabsPanel
            value="single"
            className="grid grid-cols-1 gap-4 lg:grid-cols-[380px_1fr]"
          >
          <Card size="sm" className="h-fit lg:sticky lg:top-8">
            <CardHeader>
              <CardTitle>{t.orderDetailsTitle}</CardTitle>
              <CardDescription>{t.orderDetailsDesc}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="pickup"
                  className="text-xs font-medium tracking-wide text-muted-foreground uppercase"
                >
                  {t.pickupLabel}
                </Label>
                <Select
                  value={String(pickupDistrictId)}
                  onValueChange={(value) => setPickupDistrictId(Number(value))}
                >
                  <SelectTrigger id="pickup" className="w-full">
                    <SelectValue>
                      {(value: string) =>
                        BANGLADESH_DISTRICTS.find(
                          (district) => String(district.id) === value,
                        )?.name
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {BANGLADESH_DISTRICTS.map((district) => (
                      <SelectItem key={district.id} value={String(district.id)}>
                        {district.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{t.pickupHelp}</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="delivery"
                  className="text-xs font-medium tracking-wide text-muted-foreground uppercase"
                >
                  {t.deliveryLabel}
                </Label>
                <Select
                  value={String(deliveryDistrictId)}
                  onValueChange={(value) => setDeliveryDistrictId(Number(value))}
                >
                  <SelectTrigger id="delivery" className="w-full">
                    <SelectValue>
                      {(value: string) =>
                        BANGLADESH_DISTRICTS.find(
                          (district) => String(district.id) === value,
                        )?.name
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {BANGLADESH_DISTRICTS.map((district) => (
                      <SelectItem key={district.id} value={String(district.id)}>
                        {district.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{t.deliveryHelp}</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="weight" className="flex items-center gap-1.5">
                  <WeightIcon className="size-3.5" /> {t.weightLabel}
                </Label>
                <Input
                  id="weight"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={weightKg}
                  onChange={(event) => setWeightKg(event.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="price" className="flex items-center gap-1.5">
                  <Banknote className="size-3.5" /> {t.priceLabel}
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="10"
                  value={productPrice}
                  onChange={(event) => setProductPrice(event.target.value)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <Label htmlFor="cod">{t.codLabel}</Label>
                  <p className="text-xs text-muted-foreground">{t.codHelp}</p>
                </div>
                <Switch id="cod" checked={isCOD} onCheckedChange={setIsCOD} />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            {cheapest && (
              <div className="flex items-center gap-3 rounded-lg bg-primary/10 px-5 py-3 text-sm text-primary dark:text-ring">
                <Sparkles className="size-4 shrink-0" />
                <span>
                  <strong>{t.cheapestLine(cheapest.courier, formatBDT(cheapest.totalCharge))}</strong>
                  {savings > 0 && (
                    <>{t.savingsLine(priciest.courier, formatBDT(savings), savingsPct.toFixed(0))}</>
                  )}
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {quotes.length === 0 && (
                <Card className="sm:col-span-2 xl:col-span-3">
                  <CardContent className="py-10 text-center text-sm text-muted-foreground">
                    {t.emptyState}
                  </CardContent>
                </Card>
              )}

              {quotes.map((quote, index) => {
                const isWinner = index === 0;
                return (
                  <Card
                    key={quote.courier}
                    size="sm"
                    className={
                      isWinner
                        ? "border-primary/40 bg-primary/8 dark:bg-primary/6"
                        : undefined
                    }
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`size-2.5 rounded-full ${COURIER_DOT[quote.courier]}`}
                          />
                          <CardTitle className="text-lg">{quote.courier}</CardTitle>
                        </div>
                        {isWinner && (
                          <Badge className="gap-1 bg-primary text-primary-foreground hover:bg-primary">
                            <Crown className="size-3" /> {t.cheapestBadge}
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{quote.zoneLabel}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{t.baseCharge}</span>
                        <span>{formatBDT(quote.baseCharge)}</span>
                      </div>
                      {quote.overageCharge > 0 && (
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{t.overage}</span>
                          <span>{formatBDT(quote.overageCharge)}</span>
                        </div>
                      )}
                      {quote.codCharge > 0 && (
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{t.codFee}</span>
                          <span>{formatBDT(quote.codCharge)}</span>
                        </div>
                      )}
                      <Separator className="my-1" />
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-medium">{t.total}</span>
                        <span className="text-2xl font-semibold tabular-nums">
                          {formatBDT(quote.totalCharge)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{quote.slabNote}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
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
