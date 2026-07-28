"use client";

import { useEffect, useSyncExternalStore } from "react";

import { type Dictionary, type Lang, dictionaries } from "@/lib/i18n";

const STORAGE_KEY = "courier-lang";

let currentLang: Lang = "en";
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated) return;
  hydrated = true;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "bn" || stored === "en") currentLang = stored;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Lang {
  hydrate();
  return currentLang;
}

function getServerSnapshot(): Lang {
  return "en";
}

export function setLang(next: Lang) {
  hydrated = true;
  currentLang = next;
  window.localStorage.setItem(STORAGE_KEY, next);
  listeners.forEach((listener) => listener());
}

export function useLanguage(): { lang: Lang; setLang: (lang: Lang) => void; t: Dictionary } {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Syncs the DOM `lang` attribute (drives the Bangla font-swap in
  // globals.css) with React state — an external-system update, not a
  // setState-in-effect, so this is the correct place for it.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return { lang, setLang, t: dictionaries[lang] };
}
