/**
 * Specifications Table
 *
 * Displays full product specifications in a clean table format.
 */

import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/lib/product-registry";
import { cn } from "@/lib/utils";

interface SpecificationsTableProps {
  product: Product;
}

export function SpecificationsTable({ product }: SpecificationsTableProps) {
  // Build specifications array from product data
  const specs: { label: string; value: string | undefined }[] = [
    { label: "Brand", value: product.brand },
    { label: "Capacity", value: `${product.capacity} ${product.capacityUnit}` },
    { label: "Form Factor", value: product.formFactor },
    { label: "Technology", value: product.technology },
    { label: "Condition", value: product.condition },
    { label: "Warranty", value: product.warranty },
    { label: "Certification", value: product.certification },
    { label: "Modularity", value: product.modularityTyp },
  ].filter((spec) => spec.value); // Remove empty values

  return (
    <div className="overflow-hidden">
      <table className="w-full border-collapse border-t border-zinc-100">
        <tbody>
          {specs.map((spec, index) => (
            <tr
              key={spec.label}
              className={cn(
                "transition-colors hover:bg-zinc-50/80",
                index % 2 === 0 ? "bg-zinc-50/40" : "bg-white",
              )}
            >
              <td className="w-2/5 px-6 py-3.5 text-[13px] font-bold tracking-wider text-zinc-400 uppercase">
                {spec.label}
              </td>
              <td className="border-l border-zinc-50 px-6 py-3.5 text-[13px] font-bold text-zinc-900">
                {spec.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
