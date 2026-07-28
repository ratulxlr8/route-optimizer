"use client";

import { Languages } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-store";

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  const nextLang = lang === "en" ? "bn" : "en";

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="gap-1.5"
      onClick={() => setLang(nextLang)}
    >
      <Languages className="size-3.5" />
      {nextLang === "bn" ? "বাংলা" : "English"}
    </Button>
  );
}
