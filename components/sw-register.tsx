"use client";

import { useEffect } from "react";

/**
 * Registers public/sw.js in production only — registering in dev would mean
 * the service worker's cached shell fights with Turbopack's HMR, serving
 * stale markup after every edit.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Offline support is a progressive enhancement, not a hard requirement
      // — a failed registration (unsupported browser, blocked storage) just
      // means the app behaves like an ordinary online-only page.
    });
  }, []);

  return null;
}
