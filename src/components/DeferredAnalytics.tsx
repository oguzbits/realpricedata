"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useEffect, useState } from "react";

/**
 * Deferred Analytics and SpeedInsights loader
 *
 * Loads analytics components after hydration to improve TTI.
 * (Vercel Best Practices: bundle-defer-third-party)
 */
export function DeferredAnalytics() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Defer loading until after initial hydration is complete
    // Use requestIdleCallback for truly non-blocking loading
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(() => setMounted(true));
    } else {
      // Fallback for Safari
      setTimeout(() => setMounted(true), 100);
    }
  }, []);

  if (!mounted) return null;

  return (
    <>
      <SpeedInsights />
      <Analytics />
    </>
  );
}
