"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ProductFilters } from "./ProductFilters";
import { ProductList } from "./ProductList";
import { FilteredProductListProps, FilterType } from "./productList.schema";

export function FilteredProductList({
  products,
  userSex,
  userId,
}: FilteredProductListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<FilterType>({
    sport: searchParams.get("sport") || undefined,
    level: searchParams.get("level") || undefined,
    onlyGirls: searchParams.get("onlyGirls") === "true",
    location: undefined,
  });

  const handleFilterChange = (newFilters: FilterType) => {
    const params = new URLSearchParams(searchParams);

    if (newFilters.sport) params.set("sport", newFilters.sport);
    else params.delete("sport");

    if (newFilters.level) params.set("level", newFilters.level);
    else params.delete("level");

    if (newFilters.onlyGirls) params.set("onlyGirls", "true");
    else params.delete("onlyGirls");

    router.push(`?${params.toString()}`);
    setFilters(newFilters);
  };

  const resetFilters = () => {
    const emptyFilters: FilterType = {
      sport: undefined,
      level: undefined,
      onlyGirls: false,
      location: undefined,
    };
    router.push(window.location.pathname);
    setFilters(emptyFilters);
  };

  const filteredProducts = products.filter((product) => {
    if (filters.sport && product.sport !== filters.sport) return false;
    if (filters.level && product.level !== filters.level) return false;
    return true;
  });
  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="w-full lg:sticky lg:top-4 lg:h-[calc(100vh-6rem)] lg:w-64">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-medium">Filtres</h3>
          {(filters.sport || filters.level || filters.onlyGirls) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="flex items-center gap-2"
            >
              <X className="size-4" />
              Réinitialiser les filtres
            </Button>
          )}
        </div>
        <ProductFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          showGenderFilter={userSex === "F"}
        />
      </div>
      <div className="flex-1">
        <ProductList products={products} userId={userId} />
      </div>
    </div>
  );
}
