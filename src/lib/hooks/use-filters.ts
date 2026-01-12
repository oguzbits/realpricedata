"use client";

import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsFloat,
  parseAsString,
  useQueryStates,
} from "nuqs";

/**
 * Hook to manage filter state via URL search parameters.
 * Using nuqs for robust URL state management.
 */
export const useFilters = () => {
  return useQueryStates(
    {
      condition: parseAsArrayOf(parseAsString).withDefault([]),
      technology: parseAsArrayOf(parseAsString).withDefault([]),
      formFactor: parseAsArrayOf(parseAsString).withDefault([]),
      brand: parseAsArrayOf(parseAsString).withDefault([]),
      cores: parseAsArrayOf(parseAsString).withDefault([]),
      socket: parseAsArrayOf(parseAsString).withDefault([]),
      minCapacity: parseAsFloat,
      maxCapacity: parseAsFloat,
      minPrice: parseAsInteger,
      maxPrice: parseAsInteger,
      search: parseAsString.withDefault(""),
      // Common sorting / view
      sort: parseAsString.withDefault("popular"),
      view: parseAsString.withDefault("grid"),
    },
    {
      shallow: false,
    },
  );
};
