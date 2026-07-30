"use client";

import { HelpCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-store";
import { startTour } from "@/lib/tour-store";

export function TourHelpButton() {
  const { t } = useLanguage();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={t.tourHelpLabel}
      title={t.tourHelpLabel}
      onClick={startTour}
    >
      <HelpCircle className="size-4" />
    </Button>
  );
}
