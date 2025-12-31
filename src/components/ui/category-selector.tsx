"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CategorySelectorProps {
  categories: { label: string; value: string }[];
  onCategoryChange: (value: string) => void;
}

export function CategorySelector({
  categories,
  onCategoryChange,
}: CategorySelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const handleChange = (value: string) => {
    setSelectedCategory(value);
    onCategoryChange(value);
  };

  return (
    <Select value={selectedCategory} onValueChange={handleChange}>
      <SelectTrigger className="bg-secondary/50 border-border/60 ring-offset-background hover:bg-secondary/70 hover:border-primary/30 h-9 w-[160px] rounded-xl text-sm font-bold transition-all">
        <SelectValue placeholder="All Categories" />
      </SelectTrigger>
      <SelectContent className="border-border/60 rounded-xl">
        {categories.map((cat) => (
          <SelectItem
            key={cat.value}
            value={cat.value}
            className="rounded-lg text-sm font-medium"
          >
            {cat.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
