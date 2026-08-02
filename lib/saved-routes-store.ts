"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "courier-saved-routes";
const MAX_SAVED_ROUTES = 8;

export interface SavedRoute {
  pickupDistrictId: number;
  deliveryDistrictId: number;
}

// A stable reference, not `[]` inline in getServerSnapshot — a fresh array
// literal on every call fails useSyncExternalStore's Object.is check and
// triggers React's "getServerSnapshot should be cached" infinite-loop guard.
const EMPTY_ROUTES: SavedRoute[] = [];

let routes: SavedRoute[] = EMPTY_ROUTES;
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated) return;
  hydrated = true;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) routes = JSON.parse(stored);
  } catch {
    routes = [];
  }
}

function persist() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  hydrate();
  return routes;
}

function getServerSnapshot(): SavedRoute[] {
  return EMPTY_ROUTES;
}

function isSameRoute(a: SavedRoute, b: SavedRoute) {
  return a.pickupDistrictId === b.pickupDistrictId && a.deliveryDistrictId === b.deliveryDistrictId;
}

/** Adds the route if it's new, or drops it if it's already saved — one star
 *  button doing double duty as save/remove rather than separate controls. */
export function toggleSavedRoute(pickupDistrictId: number, deliveryDistrictId: number) {
  hydrate();
  const next = { pickupDistrictId, deliveryDistrictId };
  routes = routes.some((route) => isSameRoute(route, next))
    ? routes.filter((route) => !isSameRoute(route, next))
    : [next, ...routes].slice(0, MAX_SAVED_ROUTES);
  persist();
  listeners.forEach((listener) => listener());
}

export function removeSavedRoute(pickupDistrictId: number, deliveryDistrictId: number) {
  hydrate();
  routes = routes.filter((route) => !isSameRoute(route, { pickupDistrictId, deliveryDistrictId }));
  persist();
  listeners.forEach((listener) => listener());
}

export function useSavedRoutes(): SavedRoute[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
