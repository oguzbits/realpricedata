"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { DEFAULT_COUNTRY, isValidCountryCode } from "@/lib/countries";
import {
  BookOpen,
  FileText,
  Home,
  LayoutGrid,
  Package,
  Search,
} from "lucide-react";
import { usePathname } from "next/navigation";
import * as React from "react";
import { useEffect, useState } from "react";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchItem {
  id: string;
  title: string;
  description?: string;
  group: string;
  url: string;
  icon?: string;
  meta?: any;
}

const ICON_MAP: Record<string, any> = {
  LayoutGrid,
  FileText,
  Package,
  Home,
  BookOpen,
};

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const pathname = usePathname();

  // Extract country from pathname - check if first segment is a valid country code
  const pathSegments = pathname.split("/").filter(Boolean);
  const firstSegment = pathSegments[0] || "";
  const country = isValidCountryCode(firstSegment)
    ? firstSegment
    : DEFAULT_COUNTRY;

  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch search index on open
  useEffect(() => {
    if (open && items.length === 0) {
      setLoading(true);
      // Use absolute URL to avoid relative path issues
      const apiUrl = `${window.location.origin}/api/search?country=${country}`;
      fetch(apiUrl)
        .then((res) => res.json())
        .then((data) => {
          setItems(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load search index", err);
          setLoading(false);
        });
    }
  }, [open, country, items.length]);

  const handleSelect = React.useCallback(
    (url: string) => {
      onOpenChange(false);
      // Use window.location for absolute navigation
      window.location.href = url;
    },
    [onOpenChange],
  );

  const groupedItems = React.useMemo(() => {
    const groups: Record<string, SearchItem[]> = {};
    items.forEach((item) => {
      if (!groups[item.group]) groups[item.group] = [];
      groups[item.group].push(item);
    });
    return groups;
  }, [items]);

  const groupOrder = [
    "Categories",
    "Products",
    "Calculators",
    "Articles",
    "Navigation",
  ];

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search for products, categories, or guides..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {loading && (
          <div className="text-muted-foreground p-4 text-center text-sm">
            Loading...
          </div>
        )}
        {!loading &&
          groupOrder.map((group) => {
            const groupItems = groupedItems[group];
            if (!groupItems || groupItems.length === 0) return null;

            return (
              <React.Fragment key={group}>
                <CommandGroup heading={group}>
                  {groupItems.map((item) => {
                    const IconComponent =
                      (item.icon && ICON_MAP[item.icon]) || Search;
                    return (
                      <CommandItem
                        key={item.id}
                        value={`${item.title} ${item.description || ""} ${item.group} ${item.url}`}
                        onSelect={() => handleSelect(item.url)}
                      >
                        <IconComponent className="mr-2 h-4 w-4" />
                        <div className="flex flex-col">
                          <span className="text-base">{item.title}</span>
                          {item.description && (
                            <span className="text-muted-foreground text-xs">
                              {item.description}
                            </span>
                          )}
                        </div>
                        {item.meta?.price && (
                          <span className="text-muted-foreground ml-auto font-medium">
                            {new Intl.NumberFormat(undefined, {
                              style: "currency",
                              currency: item.meta.currency || "USD",
                            }).format(item.meta.price)}
                          </span>
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                <CommandSeparator />
              </React.Fragment>
            );
          })}
      </CommandList>
    </CommandDialog>
  );
}
