import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { getCategoryFilterOptions } from "@/lib/utils/category-utils";
import { RotateCcw } from "lucide-react";

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
    <div className="flex flex-col gap-4">
      <div className="flex h-9 items-center justify-between border-b">
        <h2 className="text-sm font-bold sm:text-base">Filters</h2>
        <button
          type="button"
          onClick={onReset}
          className={cn(
            "text-primary flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-base font-semibold transition-colors hover:bg-blue-500/10",
            !hasActiveFilters && "invisible",
          )}
        >
          <RotateCcw className="h-4 w-4" />
          Reset All
        </button>
      </div>
      {/* Condition Filter */}
      <div className="border-b">
        <div className="py-2.5 text-sm font-bold sm:text-base">Condition</div>
        <div className="space-y-1.5 pt-1 pb-3">
          {["New", "Used", "Renewed"].map((condition) => (
            <div key={condition} className="flex items-center space-x-3 py-1.5">
              <Checkbox
                id={`condition-${condition}`}
                checked={filters.condition?.includes(condition) || false}
                onCheckedChange={() => onFilterChange("condition", condition)}
              />
              <Label
                htmlFor={`condition-${condition}`}
                className="cursor-pointer text-sm leading-none font-medium sm:text-base"
              >
                {condition}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Capacity Filter */}
      <div className="border-b">
        <div className="py-2.5 text-sm font-bold sm:text-base">
          Capacity ({unitLabel})
        </div>
        <div className="flex items-center gap-2 pt-1 pb-3">
          <div className="relative flex-1">
            <Input
              type="number"
              placeholder="Min"
              value={filters.minCapacity ?? ""}
              onChange={(e) => {
                const val = e.target.value ? parseFloat(e.target.value) : null;
                onCapacityChange(val, filters.maxCapacity ?? null);
              }}
              className="dark:bg-secondary/40 w-full bg-white pr-8 shadow-sm transition-colors"
            />
            <span className="text-muted-foreground absolute top-2.5 right-3 text-sm">
              {unitLabel}
            </span>
          </div>
          <span className="text-muted-foreground">-</span>
          <div className="relative flex-1">
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxCapacity ?? ""}
              onChange={(e) => {
                const val = e.target.value ? parseFloat(e.target.value) : null;
                onCapacityChange(filters.minCapacity ?? null, val);
              }}
              className="dark:bg-secondary/40 w-full bg-white pr-8 shadow-sm transition-colors"
            />
            <span className="text-muted-foreground absolute top-2.5 right-3 text-sm">
              {unitLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Technology Filter */}
      <div className="border-b">
        <div className="py-2.5 text-sm font-bold sm:text-base">
          {categorySlug === "power-supplies" ? "Certification" : "Technology"}
        </div>
        <div className="space-y-1.5 pt-1 pb-3">
          {techOptions.map((tech) => (
            <div key={tech} className="flex items-center space-x-3 py-1.5">
              <Checkbox
                id={`tech-${tech}`}
                checked={filters.technology?.includes(tech) || false}
                onCheckedChange={() => onFilterChange("technology", tech)}
              />
              <Label
                htmlFor={`tech-${tech}`}
                className="cursor-pointer text-sm leading-none font-medium sm:text-base"
              >
                {tech}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Form Factor Filter */}
      <div className="border-none">
        <div className="py-2.5 text-sm font-bold sm:text-base">Form Factor</div>
        <div className="space-y-1.5 pt-1 pb-3">
          {formFactorOptions.map((ff) => (
            <div key={ff} className="flex items-center space-x-3 py-1.5">
              <Checkbox
                id={`ff-${ff}`}
                checked={filters.formFactor?.includes(ff) || false}
                onCheckedChange={() => onFilterChange("formFactor", ff)}
              />
              <Label
                htmlFor={`ff-${ff}`}
                className="cursor-pointer text-sm leading-none font-medium sm:text-base"
              >
                {ff}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
