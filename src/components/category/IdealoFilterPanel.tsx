/**
 * Idealo Filter Bar - sr-filterBar_t26b_
 *
 * Based on actual Idealo HTML structure:
 * - sr-filterBox_Kcxex - Filter section container
 * - sr-boxTitle_Edq1D - Section title
 * - sr-filterBox__content_sBZlc - Section content
 * - sr-priceSlider_xVACy - Price range slider
 */

"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getCategoryFilterOptions } from "@/lib/utils/category-utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";

interface IdealoFilterBarProps {
  categorySlug: string;
  unitLabel: string;
}

interface FilterBoxProps {
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function FilterBox({
  title,
  count,
  defaultOpen = true,
  children,
}: FilterBoxProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="sr-filterBox border-b border-[#dcdcdc] py-3">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="sr-boxTitle flex w-full cursor-pointer items-center justify-between text-left"
      >
        <span className="text-[14px] font-bold text-[#2d2d2d]">
          {title}
          {count !== undefined && (
            <span className="ml-1 font-normal text-[#767676]">({count})</span>
          )}
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-[#767676]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[#767676]" />
        )}
      </button>
      {isOpen && <div className="sr-filterBox__content mt-3">{children}</div>}
    </div>
  );
}

interface FilterOptionProps {
  id: string;
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
}

function FilterOption({
  id,
  label,
  count,
  checked,
  onChange,
}: FilterOptionProps) {
  return (
    <div className="sr-filterOption flex items-center gap-2.5 py-1">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        className={cn(
          "h-4 w-4 rounded-none",
          "border-[#b4b4b4] bg-white",
          "data-[state=checked]:border-[#0771d0] data-[state=checked]:bg-[#0771d0]",
        )}
      />
      <label
        htmlFor={id}
        className="flex flex-1 cursor-pointer items-center justify-between text-[14px] text-[#2d2d2d]"
      >
        <span>{label}</span>
        {count !== undefined && (
          <span className="text-[#767676]">({count})</span>
        )}
      </label>
    </div>
  );
}

export function IdealoFilterPanel({
  categorySlug,
  unitLabel,
}: IdealoFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { techOptions, formFactorOptions } =
    getCategoryFilterOptions(categorySlug);

  // Current filter values from URL
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

  const updateFilter = useCallback(
    (filterName: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const current = params.get(filterName)?.split(",").filter(Boolean) || [];

      if (current.includes(value)) {
        const updated = current.filter((v) => v !== value);
        if (updated.length > 0) {
          params.set(filterName, updated.join(","));
        } else {
          params.delete(filterName);
        }
      } else {
        params.set(filterName, [...current, value].join(","));
      }

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const updatePriceRange = useCallback(
    (min: string, max: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (min) params.set("minPrice", min);
      else params.delete("minPrice");
      if (max) params.set("maxPrice", max);
      else params.delete("maxPrice");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const resetFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  return (
    <div className="sr-filterBar__content w-full rounded-[2px] bg-[#e8f4fc] p-4">
      {/* Price Filter - sr-priceSlider */}
      <div className="sr-priceSlider border-b border-[#dcdcdc] pb-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[14px] font-bold text-[#2d2d2d]">Preis</span>
          <button
            type="button"
            onClick={resetFilters}
            className={cn(
              "text-[14px] text-[#0771d0] hover:underline",
              !hasActiveFilters && "pointer-events-none opacity-0",
            )}
          >
            Zurücksetzen
          </button>
        </div>

        <div className="flex h-10 items-center gap-2">
          <Input
            type="number"
            placeholder="0 €"
            value={minPrice}
            onChange={(e) => updatePriceRange(e.target.value, maxPrice)}
            className="h-10 flex-1 rounded-none border-[#b4b4b4] bg-white text-[14px]"
          />
          <span className="text-[#767676]">–</span>
          <Input
            type="number"
            placeholder="∞"
            value={maxPrice}
            onChange={(e) => updatePriceRange(minPrice, e.target.value)}
            className="h-10 flex-1 rounded-none border-[#b4b4b4] bg-white text-[14px]"
          />
          <button
            type="button"
            onClick={() => updatePriceRange(minPrice, maxPrice)}
            className="flex h-10 w-10 items-center justify-center rounded-[2px] bg-[#0771d0] text-white hover:bg-[#0665bb]"
          >
            →
          </button>
        </div>
      </div>

      {/* Condition Filter */}
      <FilterBox title="Zustand" count={3}>
        <div className="space-y-0.5">
          {[
            { value: "New", label: "Neu", count: 128 },
            { value: "Used", label: "Gebraucht", count: 45 },
            { value: "Renewed", label: "B-Ware", count: 12 },
          ].map((condition) => (
            <FilterOption
              key={condition.value}
              id={`condition-${condition.value}`}
              label={condition.label}
              count={condition.count}
              checked={currentConditions.includes(condition.value)}
              onChange={() => updateFilter("condition", condition.value)}
            />
          ))}
        </div>
      </FilterBox>

      {/* Capacity Filter */}
      <FilterBox title={`Kapazität (${unitLabel})`}>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              type="number"
              placeholder="Min"
              className="h-10 rounded-none border-[#b4b4b4] bg-white pr-10 text-[14px]"
            />
            <span className="pointer-events-none absolute top-2.5 right-2 text-[13px] text-[#767676]">
              {unitLabel}
            </span>
          </div>
          <span className="text-[#767676]">–</span>
          <div className="relative flex-1">
            <Input
              type="number"
              placeholder="Max"
              className="h-10 rounded-none border-[#b4b4b4] bg-white pr-10 text-[14px]"
            />
            <span className="pointer-events-none absolute top-2.5 right-2 text-[13px] text-[#767676]">
              {unitLabel}
            </span>
          </div>
        </div>
      </FilterBox>

      {/* Technology Filter */}
      <FilterBox
        title={
          categorySlug === "power-supplies" ? "Zertifizierung" : "Technologie"
        }
        count={techOptions.length}
      >
        <div className="space-y-0.5">
          {techOptions.map((tech, idx) => (
            <FilterOption
              key={tech}
              id={`tech-${tech}`}
              label={tech}
              count={50 + idx * 10}
              checked={currentTech.includes(tech)}
              onChange={() => updateFilter("technology", tech)}
            />
          ))}
        </div>
      </FilterBox>

      {/* Form Factor Filter */}
      <FilterBox title="Bauform" count={formFactorOptions.length}>
        <div className="space-y-0.5">
          {formFactorOptions.map((ff, idx) => (
            <FilterOption
              key={ff}
              id={`ff-${ff}`}
              label={ff}
              count={30 + idx * 5}
              checked={currentFormFactor.includes(ff)}
              onChange={() => updateFilter("formFactor", ff)}
            />
          ))}
        </div>
      </FilterBox>
    </div>
  );
}
