/**
 * Idealo Filter Bar - sr-filterBar_t26b_
 *
 * PIXEL-PERFECT REPLICATION OF: idealo-cpu-filter-panel.html
 */

"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { getUniqueFieldValues } from "@/lib/utils/category-utils";
import { useState, useMemo } from "react";
import { allCategories, CategorySlug } from "@/lib/categories";
import { Product } from "@/lib/product-registry";
import { useFilters } from "@/lib/hooks/use-filters";
import { X } from "lucide-react";

interface IdealoFilterBarProps {
  categorySlug: string;
  unitLabel: string;
  isMobile?: boolean;
  onFilterChange?: () => void;
  products?: Product[];
}

// ============================================
// SVG ICONS (EXTRACTED FROM IDEALO HTML)
// ============================================

const ToggleIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    className={cn("transition-transform duration-200", className)}
  >
    <path d="M12 16a1 1 0 0 1-.7-.3l-6-6a1 1 0 0 1 1.4-1.4l5.3 5.3 5.3-5.3a1 1 0 0 1 1.4 1.4l-6 6a1 1 0 0 1-.7.3" />
  </svg>
);

const SearchIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    className={cn("text-[#767676]", className)}
  >
    <path d="m22.7 21.3-4.8-4.8a9.6 9.6 0 1 0-1.4 1.4l4.7 4.8a1 1 0 1 0 1.5-1.4M3 10.5a7.5 7.5 0 1 1 7.5 7.5A7.5 7.5 0 0 1 3 10.5" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    className="h-5 w-5 fill-current"
  >
    <path d="M7 23a1 1 0 0 1-.7-.17l9.3-9.3-9.3-9.3a1 1 0 0 1 1.4-1.4l10 10a1 1 0 0 1 0 1.4l-10 10a1 1 0 0 1-.7.3" />
  </svg>
);

// ============================================
// SUB-COMPONENTS
// ============================================

interface FilterBoxProps {
  title: string;
  activeCount?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
  isClickable?: boolean;
  isMobile?: boolean;
  onReset?: () => void;
}

function FilterBox({
  title,
  activeCount = 0,
  defaultOpen = true,
  children,
  isClickable = true,
  isMobile = false,
  onReset,
}: FilterBoxProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        "sr-filterBox_Kcxex",
        !isMobile
          ? "border-b border-white bg-[#D7E3EF] px-[15px] py-[10px]"
          : "border-b border-[#e0e0e0] bg-white px-4 py-3",
      )}
    >
      <div
        className={cn(
          "sr-boxTitle_Edq1D flex h-10 w-full items-center justify-between",
          isClickable && "cursor-pointer",
        )}
        onClick={() => isClickable && setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <span className="sr-boxTitle__text_GpnLJ text-[14px] font-bold text-[#0A3761]">
            {title}
          </span>
          {activeCount > 0 && !onReset && (
            <span className="sr-filterGroup__count_v8Ba5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#0771D0] text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeCount > 0 && onReset && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReset();
              }}
              className="text-[12px] font-medium text-[#0771D0] hover:underline"
            >
              Zurücksetzen
            </button>
          )}
          {isClickable && (
            <ToggleIcon
              className={cn(
                "sr-boxTitle__toggleIcon_HOxDo text-[#0A3761]",
                isOpen && "rotate-180",
              )}
            />
          )}
        </div>
      </div>
      {isOpen && (
        <div className="sr-filterBox__content_sBZlc sr-filterBox__content--titled_kHny8 mt-2">
          {children}
        </div>
      )}
    </div>
  );
}

export function IdealoFilterPanel({
  categorySlug,
  unitLabel,
  isMobile = false,
  onFilterChange,
  products = [],
}: IdealoFilterBarProps) {
  const [filters, setFilters] = useFilters();
  const category = allCategories[categorySlug as CategorySlug];

  // Group search states
  const [groupSearch, setGroupSearch] = useState<Record<string, string>>({});
  const [groupShowAll, setGroupShowAll] = useState<Record<string, boolean>>({});

  // Derive options for filter groups
  const filterGroupOptions = useMemo(() => {
    if (!category?.filterGroups) return {};
    const options: Record<string, string[]> = {};
    category.filterGroups.forEach((group) => {
      if (group.options) {
        options[group.field] = group.options;
      } else if (products.length > 0) {
        options[group.field] = getUniqueFieldValues(products, group.field);
      } else {
        options[group.field] = [];
      }
    });
    return options;
  }, [category, products]);

  // Handle price update
  const handlePriceUpdate = (min: string, max: string) => {
    setFilters({
      minPrice: min ? parseInt(min) : null,
      maxPrice: max ? parseInt(max) : null,
    });
    if (onFilterChange) onFilterChange();
  };

  // Generic checkbox update
  const toggleCheckbox = (field: string, value: string) => {
    const current = (filters as any)[field] || [];
    const next = current.includes(value)
      ? current.filter((v: string) => v !== value)
      : [...current, value];

    setFilters({ [field]: next });
    if (onFilterChange) onFilterChange();
  };

  return (
    <div
      className={cn(
        "sr-filterBar_t26b_",
        "flex h-full min-h-full w-full flex-col",
        !isMobile ? "bg-transparent p-0" : "bg-[#f9f9f9]",
      )}
    >
      <div className="sr-filterBar__content_eiiz2">
        {/* PRICE SECTION */}
        <FilterBox
          title="Preis"
          activeCount={
            filters.minPrice !== null || filters.maxPrice !== null ? 1 : 0
          }
          isClickable={false}
          isMobile={isMobile}
          onReset={() => setFilters({ minPrice: null, maxPrice: null })}
        >
          <div className="sr-priceInteractionWidget_aTL8j space-y-4 py-2">
            <div className="sr-priceInteractionWidget__inputGroup_vgde0 flex items-center gap-1.5">
              <div className="sr-iFormElement_Fwa2t relative flex-1">
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="von"
                  value={filters.minPrice?.toString() || ""}
                  onChange={(e) =>
                    setFilters({
                      minPrice: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    })
                  }
                  className="sr-iInput_KnTXI h-10 w-full rounded-[4px] border border-[#B4B4B4] bg-white pr-6 pl-3 text-[14px] focus:border-[#0771D0] focus:outline-none"
                />
                <span className="sr-priceInteractionWidget__currencyIcon_yjBxb absolute top-2.5 right-2 text-[14px] text-[#767676]">
                  €
                </span>
              </div>
              <span className="sr-priceInteractionWidget__separator_Eo5sa px-2 text-[#767676]">
                -
              </span>
              <div className="sr-iFormElement_Fwa2t relative flex-1">
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="bis"
                  value={filters.maxPrice?.toString() || ""}
                  onChange={(e) =>
                    setFilters({
                      maxPrice: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    })
                  }
                  className="sr-iInput_KnTXI h-10 w-full rounded-[4px] border border-[#B4B4B4] bg-white pr-6 pl-3 text-[14px] focus:border-[#0771D0] focus:outline-none"
                />
                <span className="sr-priceInteractionWidget__currencyIcon_yjBxb absolute top-2.5 right-2 text-[14px] text-[#767676]">
                  €
                </span>
              </div>
              <button
                onClick={() =>
                  handlePriceUpdate(
                    filters.minPrice?.toString() || "",
                    filters.maxPrice?.toString() || "",
                  )
                }
                className="sr-iButton__default_Ihhof flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] bg-[#0771D0] text-white hover:bg-[#0050a0]"
              >
                <ArrowRightIcon />
              </button>
            </div>

            {/* Price Ranges Wrapper */}
            <div className="sr-priceBox__rangesWrapper_fhTcS mt-3 space-y-1">
              {[
                { label: "bis 130 €", min: null, max: 130 },
                { label: "130 € bis 330 €", min: 130, max: 330 },
                { label: "330 € bis 940 €", min: 330, max: 940 },
                { label: "ab 940 €", min: 940, max: null },
              ].map((range, idx) => {
                const isSelected =
                  filters.minPrice === range.min &&
                  filters.maxPrice === range.max;
                return (
                  <label
                    key={idx}
                    className="group/item flex cursor-pointer items-center justify-between py-1"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        className="h-[18px] w-[18px] rounded-[3px] border-[#B4B4B4] bg-white data-[state=checked]:border-[#0771D0] data-[state=checked]:bg-[#0771D0]"
                        checked={isSelected}
                        onCheckedChange={() => {
                          if (isSelected) {
                            setFilters({ minPrice: null, maxPrice: null });
                          } else {
                            setFilters({
                              minPrice: range.min,
                              maxPrice: range.max,
                            });
                          }
                        }}
                      />
                      <span className="text-[13px] text-[#2d2d2d] group-hover/item:text-[#0771D0]">
                        {range.label}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </FilterBox>

        {/* DYNAMIC FILTER GROUPS */}
        {category?.filterGroups?.map((group) => {
          const options = filterGroupOptions[group.field] || [];
          if (options.length === 0) return null;

          const currentValues = (filters as any)[group.field] || [];
          const query = groupSearch[group.field] || "";
          const isExpanded = groupShowAll[group.field] || false;

          const filteredOptions = options.filter((opt) =>
            opt.toLowerCase().includes(query.toLowerCase()),
          );

          return (
            <FilterBox
              key={group.field}
              title={group.label}
              activeCount={currentValues.length}
              isMobile={isMobile}
              onReset={() => setFilters({ [group.field]: [] })}
            >
              <div className="sr-filterGroup__content_aXh9x space-y-3">
                {/* Search input for large lists */}
                {options.length > 5 && (
                  <div className="sr-iFormElement_Fwa2t sr-regularFilters__searchInput_KVuIA relative">
                    <input
                      type="text"
                      placeholder={`${group.label} suchen...`}
                      value={query}
                      onChange={(e) =>
                        setGroupSearch((prev) => ({
                          ...prev,
                          [group.field]: e.target.value,
                        }))
                      }
                      className="sr-iInput_KnTXI h-10 w-full rounded-[4px] border border-[#B4B4B4] bg-white pr-10 pl-3 text-[14px] focus:border-[#0771D0] focus:outline-none"
                    />
                    <div className="pointer-events-none absolute top-0 right-0 flex h-10 w-10 items-center justify-center">
                      <SearchIcon className="h-5 w-5" />
                    </div>
                  </div>
                )}

                <div className="sr-filterList_qktgT space-y-1">
                  {filteredOptions
                    .slice(0, isExpanded ? undefined : 6)
                    .map((option) => (
                      <label
                        key={option}
                        className="group/item flex cursor-pointer items-center justify-between py-1"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id={`${group.field}-${option}`}
                            checked={currentValues.includes(option)}
                            onCheckedChange={() =>
                              toggleCheckbox(group.field, option)
                            }
                            className="h-[18px] w-[18px] rounded-[3px] border-[#B4B4B4] bg-white data-[state=checked]:border-[#0771D0] data-[state=checked]:bg-[#0771D0]"
                          />
                          <span className="text-[13px] text-[#2d2d2d] group-hover/item:text-[#0771D0]">
                            {option}
                          </span>
                        </div>
                      </label>
                    ))}
                </div>

                {!isExpanded && filteredOptions.length > 6 && (
                  <button
                    onClick={() =>
                      setGroupShowAll((prev) => ({
                        ...prev,
                        [group.field]: true,
                      }))
                    }
                    className="sr-regularFilters__expander_K6XPQ mt-2 block text-left text-[13px] font-bold text-[#0771D0] hover:underline"
                  >
                    + alle anzeigen
                  </button>
                )}
              </div>
            </FilterBox>
          );
        })}
      </div>
    </div>
  );
}
