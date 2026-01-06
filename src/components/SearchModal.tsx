"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { allCategories, getCategoryPath } from "@/lib/categories";
import {
  CountryCode,
  DEFAULT_COUNTRY,
  isValidCountryCode,
} from "@/lib/countries";
import { BookOpen, Home, LayoutGrid, Search, TrendingUp } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Map popular keywords to specific filters for precise results
const POPULAR_SEARCH_CONFIG = [
  {
    label: "32GB DDR5 RAM",
    category: "ram",
    params: { technology: "DDR5", minCapacity: "32", maxCapacity: "32" },
  },
  {
    label: "DDR4 16GB",
    category: "ram",
    params: { technology: "DDR4", minCapacity: "16", maxCapacity: "16" },
  },
  {
    label: "2TB NVMe SSD",
    category: "hard-drives",
    params: {
      technology: "SSD",
      formFactor: "M.2 NVMe",
      minCapacity: "2",
      maxCapacity: "2",
    },
  },
  {
    label: "Samsung 990 Pro",
    category: "hard-drives",
    params: { search: "990 Pro" },
  },
  {
    label: "Crucial P310",
    category: "hard-drives",
    params: { search: "P310" },
  },
  {
    label: "850W Gold PSU",
    category: "power-supplies",
    params: { technology: "80+ Gold", minCapacity: "850", maxCapacity: "850" },
  },
];

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = React.useState("");

  const pathSegments = pathname.split("/").filter(Boolean);
  const country = isValidCountryCode(pathSegments[0] || "")
    ? (pathSegments[0] as CountryCode)
    : DEFAULT_COUNTRY;

  // Reset search when modal closes
  React.useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const handleSelect = (url: string) => {
    onOpenChange(false);
    router.push(url);
  };

  const handlePopularSearch = (
    categorySlug: string,
    params: Record<string, any>,
  ) => {
    const basePath = getCategoryPath(categorySlug as any, country);
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value));
      }
    });

    const url = `${basePath}?${searchParams.toString()}`;
    handleSelect(url);
  };

  // Filter categories based on search
  const filteredCategories = React.useMemo(() => {
    if (!search) return Object.values(allCategories).filter((c) => !c.hidden);
    const s = search.toLowerCase();
    return Object.values(allCategories).filter(
      (c) =>
        !c.hidden &&
        (c.name.toLowerCase().includes(s) ||
          c.description.toLowerCase().includes(s)),
    );
  }, [search]);

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      className="max-w-[650px]"
    >
      <CommandInput
        placeholder="What are you looking for?"
        value={search}
        onValueChange={setSearch}
      />
      <CommandList className="min-h-[300px]">
        <CommandEmpty>No results found for &quot;{search}&quot;.</CommandEmpty>

        {!search && (
          <>
            <div className="p-4 pb-2">
              <h4 className="text-muted-foreground mb-3 flex items-center gap-2 px-1 text-base font-semibold tracking-wider uppercase">
                <TrendingUp className="h-5 w-5" />
                Popular Searches
              </h4>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCH_CONFIG.map(({ label, category, params }) => (
                  <button
                    key={label}
                    onClick={() => handlePopularSearch(category, params)}
                    className="bg-accent hover:bg-accent/80 text-accent-foreground cursor-pointer rounded-full px-4 py-2 text-base font-medium transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <CommandGroup heading="Quick Navigation">
              <CommandItem
                onSelect={() =>
                  handleSelect(country === "us" ? "/" : `/${country}`)
                }
              >
                <Home className="mr-2 h-4 w-4" />
                Home
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  handleSelect(country === "us" ? "/blog" : `/${country}/blog`)
                }
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Blog & Buying Guides
              </CommandItem>
            </CommandGroup>

            <CommandGroup heading="Browse Categories">
              {Object.values(allCategories)
                .filter((c) => !c.hidden)
                .map((cat) => (
                  <CommandItem
                    key={cat.slug}
                    onSelect={() =>
                      handleSelect(getCategoryPath(cat.slug, country))
                    }
                  >
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    {cat.name}
                  </CommandItem>
                ))}
            </CommandGroup>
          </>
        )}

        {search && (
          <>
            <CommandGroup heading="Search Suggestions">
              {filteredCategories.slice(0, 5).map((cat) => (
                <CommandItem
                  key={cat.slug}
                  onSelect={() =>
                    handleSelect(
                      `${getCategoryPath(cat.slug, country)}?search=${encodeURIComponent(search)}`,
                    )
                  }
                  className="py-3"
                >
                  <Search className="mr-2 h-4 w-4" />
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold">{search}</span>
                    <span className="text-muted-foreground">in</span>
                    <span>{cat.name}</span>
                  </div>
                </CommandItem>
              ))}
              <CommandItem
                onSelect={() =>
                  handleSelect(
                    `${country === "us" ? "/" : `/${country}`}?search=${encodeURIComponent(search)}`,
                  )
                }
                className="py-3"
              >
                <Search className="mr-2 h-4 w-4" />
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">
                    Search globally for
                  </span>
                  <span className="font-semibold">&quot;{search}&quot;</span>
                </div>
              </CommandItem>
            </CommandGroup>

            {filteredCategories.length > 0 && (
              <CommandGroup heading="Jump to Category">
                {filteredCategories.map((cat) => (
                  <CommandItem
                    key={`jump-${cat.slug}`}
                    onSelect={() =>
                      handleSelect(getCategoryPath(cat.slug, country))
                    }
                  >
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    {cat.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
