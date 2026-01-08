import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { getCategoryFilterOptions } from "@/lib/utils/category-utils";
import { RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface FilterPanelProps {
  filters: {
    condition: string[];
    technology: string[];
    formFactor: string[];
    minCapacity: number | null;
    maxCapacity: number | null;
    search: string;
  };
  onFilterChange: (name: string, value: string) => void;
  onCapacityChange: (min: number | null, max: number | null) => void;
  onReset: () => void;
  unitLabel: string;
  categorySlug: string;
}

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-zinc-100">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full cursor-pointer items-center justify-between py-3 text-left"
      >
        <span className="text-[13px] font-bold text-zinc-800">{title}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-zinc-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-zinc-400" />
        )}
      </button>
      {isOpen && <div className="pb-4">{children}</div>}
    </div>
  );
}

export function FilterPanel({
  filters,
  onFilterChange,
  onCapacityChange,
  onReset,
  unitLabel,
  categorySlug,
}: FilterPanelProps) {
  const { techOptions, formFactorOptions } =
    getCategoryFilterOptions(categorySlug);

  const hasActiveFilters =
    filters.condition.length > 0 ||
    filters.technology.length > 0 ||
    filters.formFactor.length > 0 ||
    filters.minCapacity !== null ||
    filters.maxCapacity !== null ||
    filters.search !== "";

  return (
    <div className="flex flex-col">
      {/* Header with Reset */}
      <div className="mb-2 flex items-center justify-between border-b border-zinc-200 pb-3">
        <h2 className="text-[14px] font-bold text-zinc-900">Filter</h2>
        <button
          type="button"
          onClick={onReset}
          className={cn(
            "flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-[12px] font-semibold text-[#0066cc] transition-colors hover:bg-blue-50",
            !hasActiveFilters && "invisible",
          )}
        >
          <RotateCcw className="h-3 w-3" />
          Zurücksetzen
        </button>
      </div>

      {/* Price Filter - Idealo style with range inputs */}
      <CollapsibleSection title="Preis">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              type="number"
              placeholder="0"
              value={filters.minCapacity ?? ""}
              onChange={(e) => {
                const val = e.target.value ? parseFloat(e.target.value) : null;
                onCapacityChange(val, filters.maxCapacity ?? null);
              }}
              className="h-9 border-zinc-200 bg-white pr-6 text-[13px]"
            />
            <span className="absolute top-2.5 right-2 text-[11px] text-zinc-400">
              €
            </span>
          </div>
          <span className="text-zinc-300">–</span>
          <div className="relative flex-1">
            <Input
              type="number"
              placeholder="∞"
              value={filters.maxCapacity ?? ""}
              onChange={(e) => {
                const val = e.target.value ? parseFloat(e.target.value) : null;
                onCapacityChange(filters.minCapacity ?? null, val);
              }}
              className="h-9 border-zinc-200 bg-white pr-6 text-[13px]"
            />
            <span className="absolute top-2.5 right-2 text-[11px] text-zinc-400">
              €
            </span>
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded border border-zinc-200 bg-white text-zinc-600 transition-colors hover:bg-zinc-50">
            <ChevronDown className="h-4 w-4 -rotate-90" />
          </button>
        </div>
      </CollapsibleSection>

      {/* Condition Filter */}
      <CollapsibleSection title="Zustand">
        <div className="space-y-2">
          {["New", "Used", "Renewed"].map((condition) => (
            <div key={condition} className="flex items-center gap-2.5">
              <Checkbox
                id={`condition-${condition}`}
                checked={filters.condition?.includes(condition) || false}
                onCheckedChange={() => onFilterChange("condition", condition)}
                className="h-4 w-4 rounded-sm border-zinc-300"
              />
              <Label
                htmlFor={`condition-${condition}`}
                className="cursor-pointer text-[13px] text-zinc-700"
              >
                {condition === "New"
                  ? "Neu"
                  : condition === "Renewed"
                    ? "B-Ware"
                    : "Gebraucht"}
              </Label>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Capacity Filter */}
      <CollapsibleSection title={`Kapazität (${unitLabel})`}>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              type="number"
              placeholder="Min"
              value={filters.minCapacity ?? ""}
              onChange={(e) => {
                const val = e.target.value ? parseFloat(e.target.value) : null;
                onCapacityChange(val, filters.maxCapacity ?? null);
              }}
              className="h-9 border-zinc-200 bg-white pr-8 text-[13px]"
            />
            <span className="absolute top-2.5 right-2 text-[11px] text-zinc-400">
              {unitLabel}
            </span>
          </div>
          <span className="text-zinc-300">–</span>
          <div className="relative flex-1">
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxCapacity ?? ""}
              onChange={(e) => {
                const val = e.target.value ? parseFloat(e.target.value) : null;
                onCapacityChange(filters.minCapacity ?? null, val);
              }}
              className="h-9 border-zinc-200 bg-white pr-8 text-[13px]"
            />
            <span className="absolute top-2.5 right-2 text-[11px] text-zinc-400">
              {unitLabel}
            </span>
          </div>
        </div>
      </CollapsibleSection>

      {/* Technology Filter */}
      <CollapsibleSection
        title={
          categorySlug === "power-supplies" ? "Zertifizierung" : "Technologie"
        }
      >
        <div className="space-y-2">
          {techOptions.map((tech) => (
            <div key={tech} className="flex items-center gap-2.5">
              <Checkbox
                id={`tech-${tech}`}
                checked={filters.technology?.includes(tech) || false}
                onCheckedChange={() => onFilterChange("technology", tech)}
                className="h-4 w-4 rounded-sm border-zinc-300"
              />
              <Label
                htmlFor={`tech-${tech}`}
                className="cursor-pointer text-[13px] text-zinc-700"
              >
                {tech}
              </Label>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Form Factor Filter */}
      <CollapsibleSection title="Bauform">
        <div className="space-y-2">
          {formFactorOptions.map((ff) => (
            <div key={ff} className="flex items-center gap-2.5">
              <Checkbox
                id={`ff-${ff}`}
                checked={filters.formFactor?.includes(ff) || false}
                onCheckedChange={() => onFilterChange("formFactor", ff)}
                className="h-4 w-4 rounded-sm border-zinc-300"
              />
              <Label
                htmlFor={`ff-${ff}`}
                className="cursor-pointer text-[13px] text-zinc-700"
              >
                {ff}
              </Label>
            </div>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
}
