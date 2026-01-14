/**
 * Specifications Table
 *
 * Displays full product specifications in a clean table format.
 */

import { Product } from "@/lib/product-registry";
import { cn } from "@/lib/utils";

interface SpecificationsTableProps {
  product: Product;
}

export function SpecificationsTable({ product }: SpecificationsTableProps) {
  // 1. Core Base Specs
  const coreSpecs: { label: string; value: string | undefined }[] = [
    { label: "Marke", value: product.brand },
    { label: "Hersteller", value: product.manufacturer },
    {
      label: "Speicherkapazität",
      value: product.capacity
        ? `${product.capacity} ${product.capacityUnit}`
        : undefined,
    },
    { label: "Bauform", value: product.formFactor },
    { label: "Technik", value: product.technology },
    { label: "Zustand", value: product.condition },
  ];

  // 2. Map JSON Spec Bucket (Remove duplicates already in coreSpecs)
  const bucketSpecs = product.specifications
    ? Object.entries(product.specifications).map(([key, value]) => ({
        label: key, // Keep original label or map if known
        value: String(value),
      }))
    : [];

  // Combine and remove duplicates based on label
  const allSpecs = [...coreSpecs];
  bucketSpecs.forEach((b) => {
    if (
      !allSpecs.some((c) => c.label.toLowerCase() === b.label.toLowerCase()) &&
      b.value &&
      b.value !== "undefined"
    ) {
      allSpecs.push(b);
    }
  });

  const specs = allSpecs.filter((s) => s.value && s.value !== "null");

  return (
    <ul className="datasheet-list w-full text-sm">
      {specs.map((spec) => (
        <li
          key={spec.label}
          className={cn(
            "datasheet-listItem flex w-full flex-col border-b border-[#f5f5f5] px-4 py-2 md:flex-row",
            "last:border-0",
          )}
        >
          <span className="datasheet-listItemKey mb-1 w-full shrink-0 font-medium text-[#767676] md:mb-0 md:w-[40%]">
            {spec.label}
          </span>
          <span className="datasheet-listItemValue min-w-0 flex-1 font-semibold text-[#2d2d2d]">
            {spec.value}
          </span>
        </li>
      ))}
    </ul>
  );
}
