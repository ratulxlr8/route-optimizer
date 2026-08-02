"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "courier-lifetime-savings";

let total = 0;
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated) return;
  hydrated = true;
  const stored = Number(window.localStorage.getItem(STORAGE_KEY));
  if (Number.isFinite(stored) && stored > 0) total = stored;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  hydrate();
  return total;
}

function getServerSnapshot(): number {
  return 0;
}

/** Banked once per bulk-upload batch (see BulkUpload's `handleFile`) — a
 *  discrete, real processing event. The single-order tab's "you save ৳X" is
 *  a live figure that changes on every keystroke, so auto-accumulating it
 *  here would make the lifetime total meaningless (and trivially gameable by
 *  just typing). */
export function addLifetimeSavings(amount: number) {
  if (amount <= 0) return;
  hydrate();
  total += amount;
  window.localStorage.setItem(STORAGE_KEY, String(total));
  listeners.forEach((listener) => listener());
}

export function useLifetimeSavings(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
