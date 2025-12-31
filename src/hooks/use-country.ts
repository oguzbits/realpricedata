"use client";

import {
  DEFAULT_COUNTRY,
  getCountryByCode,
  isValidCountryCode,
  saveCountryPreference
} from "@/lib/countries";
import { usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";

/**
 * Hook to manage and access the current country context.
 * The country is primarily driven by the first path segment.
 */
export function useCountry() {
  const pathname = usePathname();

  // Extract country from URL path segment (e.g. /us/categories -> us)
  const countryFromPath = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const firstSegment = segments[0];
    return isValidCountryCode(firstSegment) ? firstSegment : DEFAULT_COUNTRY;
  }, [pathname]);

  const currentCountry = useMemo(() => 
    getCountryByCode(countryFromPath), 
    [countryFromPath]
  );

  /**
   * Change country by updating the URL path segment
   */
  const changeCountry = useCallback((newCountryCode: string) => {
    if (!isValidCountryCode(newCountryCode)) return;

    saveCountryPreference(newCountryCode);
    
    // Set a cookie so middleware knows the preference for future visits
    if (typeof document !== 'undefined') {
      document.cookie = `country=${newCountryCode}; path=/; max-age=31536000; samesite=lax`;
    }

    const segments = pathname.split("/").filter(Boolean);
    const firstSegment = segments[0];

    let targetPath = "";

    // Case 1: Current URL has a country code (e.g. /de/products)
    if (firstSegment && isValidCountryCode(firstSegment)) {
      const newSegments = [...segments];
      newSegments[0] = newCountryCode;
      
      // If switching to default country root, go to /
      if (newCountryCode === DEFAULT_COUNTRY && newSegments.length === 1) {
        targetPath = "/";
      } else {
        targetPath = `/${newSegments.join("/")}`;
      }
    } 
    // Case 2: Current URL is root or doesn't have country code (e.g. /blog)
    else {
      if (newCountryCode === DEFAULT_COUNTRY) {
        targetPath = pathname; // Stay on current path (e.g. /blog)
      } else {
        targetPath = `/${newCountryCode}${pathname === "/" ? "" : pathname}`;
      }
    }

    if (targetPath) {
      window.location.href = targetPath;
    }
  }, [pathname]);

  return {
    country: countryFromPath,
    currentCountry,
    changeCountry,
    hasCountryInUrl: pathname.split("/").filter(Boolean)[0] === countryFromPath,
  };
}
