"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Search } from "lucide-react";
import * as React from "react";

// Detect Mac once on client
const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPod|iPhone|iPad/.test(navigator.platform);

export function SearchButton({
  mode = "desktop",
}: {
  mode?: "mobile" | "desktop";
}) {
  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    window.triggerSearch?.();
  };

  return (
    <>
      {mode === "desktop" && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <button
            type="button"
            onClick={handleOpen}
            className="border-border bg-card hover:bg-card/80 hover:border-primary/50 hidden w-[320px] cursor-pointer items-center gap-3 rounded-md border px-4 py-2 shadow-sm sm:flex lg:w-[400px]"
            aria-label="Search all products"
          >
            <Search className="text-muted-foreground h-4 w-4" />
            <span className="text-muted-foreground flex-1 text-left text-base">
              Search all products...
            </span>
            <kbd className="bg-background/80 text-muted-foreground hidden items-center gap-1 rounded border px-2 py-0.5 text-sm font-medium lg:inline-flex">
              {isMac ? "⌘" : "Ctrl+"}K
            </kbd>
          </button>
        </div>
      )}

      {mode === "mobile" && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon-sm"
              className="cursor-pointer sm:hidden"
              onClick={handleOpen}
              aria-label="Open search"
            >
              <Search className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Search products</p>
          </TooltipContent>
        </Tooltip>
      )}
    </>
  );
}
