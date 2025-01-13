"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  LEVEL_CLASSES,
  SPORT_CLASSES,
} from "../[productId]/edit/product.schema";
import { FilterType, ProductFiltersProps } from "./productList.schema";

export function ProductFilters({
  onFilterChange,
  filters,
  className,
  showGenderFilter,
}: ProductFiltersProps) {
  const updateFilters = (newFilters: Partial<FilterType>) => {
    onFilterChange({ ...filters, ...newFilters });
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-4">
        <h3 className="font-medium">Sport</h3>
        <Select
          value={filters.sport || ""}
          onValueChange={(value) => updateFilters({ sport: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un sport" />
          </SelectTrigger>
          <SelectContent>
            {SPORT_CLASSES.map((sport) => (
              <SelectItem key={sport} value={sport}>
                {sport}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Niveau</h3>
        <Select
          value={filters.level || ""}
          onValueChange={(value) => updateFilters({ level: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un niveau" />
          </SelectTrigger>
          <SelectContent>
            {LEVEL_CLASSES.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showGenderFilter && (
        <Button
          variant="outline"
          size="lg"
          onClick={() => updateFilters({ onlyGirls: !filters.onlyGirls })}
          className={cn(
            "w-full font-medium border-pink-300 transition-all duration-200",
            filters.onlyGirls
              ? "bg-pink-100 text-pink-900 hover:bg-pink-200 border-pink-500"
              : "text-pink-700 hover:bg-pink-50 hover:text-pink-900 hover:border-pink-500"
          )}
        >
          👩 Only Girls
        </Button>
      )}
    </div>
  );
}
