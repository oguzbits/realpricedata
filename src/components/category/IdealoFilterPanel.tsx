"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getCategoryFilterOptions } from "@/lib/utils/category-utils";
import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";

interface IdealoFilterPanelProps {
  categorySlug: string;
  categoryName: string;
  productCount: number;
  unitLabel: string;
}

interface FilterSectionProps {
  title: string;
  count?: number | null;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function FilterSection({
  title,
  count,
  defaultOpen = true,
  children,
}: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-zinc-200 py-3">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full cursor-pointer items-center justify-between text-left"
      >
        <span className="text-base font-bold text-zinc-800">
          {title}
          {count !== null && count !== undefined && (
            <span className="ml-1 font-normal text-zinc-400">({count})</span>
          )}
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-zinc-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-zinc-400" />
        )}
      </button>
      {isOpen && <div className="mt-3">{children}</div>}
    </div>
  );
}

interface FilterCheckboxProps {
  id: string;
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
}

function FilterCheckbox({
  id,
  label,
  count,
  checked,
  onChange,
}: FilterCheckboxProps) {
  return (
    <div className="flex items-center gap-2.5 py-1">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        className="h-4 w-4 rounded-none border-zinc-400 bg-white data-[state=checked]:border-[#0066cc] data-[state=checked]:bg-[#0066cc]"
      />
      <label
        htmlFor={id}
        className="flex flex-1 cursor-pointer items-center justify-between text-base text-zinc-700"
      >
        <span>{label}</span>
        {count !== undefined && (
          <span className="text-zinc-500">({count})</span>
        )}
      </label>
    </div>
  );
}

export function IdealoFilterPanel({
  categorySlug,
  categoryName,
  productCount,
  unitLabel,
}: IdealoFilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get filter options for this category
  const { techOptions, formFactorOptions } =
    getCategoryFilterOptions(categorySlug);

  // Parse current filters from URL
  const currentConditions = searchParams.get("condition")?.split(",") || [];
  const currentTech = searchParams.get("technology")?.split(",") || [];
  const currentFormFactor = searchParams.get("formFactor")?.split(",") || [];
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  const hasActiveFilters =
    currentConditions.length > 0 ||
    currentTech.length > 0 ||
    currentFormFactor.length > 0 ||
    minPrice !== "" ||
    maxPrice !== "";

  // Update URL with new filter value
  const updateFilter = useCallback(
    (filterName: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const current = params.get(filterName)?.split(",").filter(Boolean) || [];

      if (current.includes(value)) {
        // Remove value
        const updated = current.filter((v) => v !== value);
        if (updated.length > 0) {
          params.set(filterName, updated.join(","));
        } else {
          params.delete(filterName);
        }
      } else {
        // Add value
        params.set(filterName, [...current, value].join(","));
      }

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const updatePriceRange = useCallback(
    (min: string, max: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (min) {
        params.set("minPrice", min);
      } else {
        params.delete("minPrice");
      }
      if (max) {
        params.set("maxPrice", max);
      } else {
        params.delete("maxPrice");
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const resetFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  return (
    <div className="w-full rounded-sm bg-[#e8f4fc] p-4">
      {/* Price Filter - with Zurücksetzen link like Idealo */}
      <div className="border-b border-zinc-200 pb-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-base font-bold text-zinc-800">Preis</span>
          <button
            type="button"
            onClick={resetFilters}
            className={cn(
              "cursor-pointer text-base text-[#0066cc] hover:underline",
              !hasActiveFilters && "pointer-events-none opacity-0",
            )}
          >
            Zurücksetzen
          </button>
        </div>
        {/* Price Inputs */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              type="number"
              placeholder="0 €"
              value={minPrice}
              onChange={(e) => updatePriceRange(e.target.value, maxPrice)}
              className="h-9 rounded-none border-zinc-300 bg-white text-base"
            />
          </div>
          <span className="text-zinc-400">–</span>
          <div className="relative flex-1">
            <Input
              type="number"
              placeholder="∞"
              value={maxPrice}
              onChange={(e) => updatePriceRange(minPrice, e.target.value)}
              className="h-9 rounded-none border-zinc-300 bg-white text-base"
            />
          </div>
          <button
            type="button"
            onClick={() => updatePriceRange(minPrice, maxPrice)}
            className="flex h-9 w-9 items-center justify-center rounded-sm bg-[#0066cc] text-white"
          >
            →
          </button>
        </div>
      </div>

      {/* Condition Filter */}
      <FilterSection title="Zustand" count={3}>
        <div className="space-y-0.5">
          {[
            { value: "New", label: "Neu", count: 128 },
            { value: "Used", label: "Gebraucht", count: 45 },
            { value: "Renewed", label: "B-Ware", count: 12 },
          ].map((condition) => (
            <FilterCheckbox
              key={condition.value}
              id={`condition-${condition.value}`}
              label={condition.label}
              count={condition.count}
              checked={currentConditions.includes(condition.value)}
              onChange={() => updateFilter("condition", condition.value)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Capacity Filter */}
      <FilterSection title={`Kapazität (${unitLabel})`}>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              type="number"
              placeholder="Min"
              className="h-9 rounded-none border-zinc-300 bg-white pr-10 text-base"
            />
            <span className="pointer-events-none absolute top-2 right-2 text-[13px] text-zinc-400">
              {unitLabel}
            </span>
          </div>
          <span className="text-zinc-400">–</span>
          <div className="relative flex-1">
            <Input
              type="number"
              placeholder="Max"
              className="h-9 rounded-none border-zinc-300 bg-white pr-10 text-base"
            />
            <span className="pointer-events-none absolute top-2 right-2 text-[13px] text-zinc-400">
              {unitLabel}
            </span>
          </div>
        </div>
      </FilterSection>

      {/* Technology Filter */}
      <FilterSection
        title={
          categorySlug === "power-supplies" ? "Zertifizierung" : "Technologie"
        }
        count={techOptions.length}
      >
        <div className="space-y-0.5">
          {techOptions.map((tech, idx) => (
            <FilterCheckbox
              key={tech}
              id={`tech-${tech}`}
              label={tech}
              count={50 + idx * 10} // Placeholder counts
              checked={currentTech.includes(tech)}
              onChange={() => updateFilter("technology", tech)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Form Factor Filter */}
      <FilterSection title="Bauform" count={formFactorOptions.length}>
        <div className="space-y-0.5">
          {formFactorOptions.map((ff, idx) => (
            <FilterCheckbox
              key={ff}
              id={`ff-${ff}`}
              label={ff}
              count={30 + idx * 5} // Placeholder counts
              checked={currentFormFactor.includes(ff)}
              onChange={() => updateFilter("formFactor", ff)}
            />
          ))}
        </div>
      </FilterSection>
    </div>
  );
}
