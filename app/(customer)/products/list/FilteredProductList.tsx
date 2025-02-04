"use client";

import { Button } from "@/components/ui/button";
import { ScrollToTop } from "@/components/ui/scrollTotop";
import { Filter, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ProductFilters } from "./ProductFilters";
import { ProductList } from "./ProductList";
import { fetchMoreProducts, getFilteredProducts } from "./productList.actions";
import { FilteredProductListProps, FilterType } from "./productList.schema";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function FilteredProductList({
  initialProducts,
  userSex,
  userId,
  venues,
}: FilteredProductListProps) {
  const [hasMore, setHasMore] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const loadMoreRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState(initialProducts);

  const [filters, setFilters] = useState<FilterType>({
    sport: searchParams.get("sport") || undefined,
    level: searchParams.get("level") || undefined,
    onlyGirls: searchParams.get("onlyGirls") === "true",
    countries: searchParams.get("countries")?.split(",") || [],
    location: undefined,
  });

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      const filteredProducts = await getFilteredProducts(filters);
      setProducts(filteredProducts);
    };
    fetchFilteredProducts();
  }, [filters]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          setLoading(true);
          const skip = products.length;
          const newProducts = await fetchMoreProducts(skip, filters);
          if (newProducts.length < 10) {
            setHasMore(false);
          }
          setProducts((prev) => [...prev, ...newProducts]);
          setLoading(false);
        }
      },
      { threshold: 1.0 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [products.length, loading, filters, hasMore]);

  const handleFilterChange = (newFilters: FilterType) => {
    const params = new URLSearchParams(searchParams);

    if (newFilters.sport) params.set("sport", newFilters.sport);
    else params.delete("sport");

    if (newFilters.level) params.set("level", newFilters.level);
    else params.delete("level");

    if (newFilters.onlyGirls) params.set("onlyGirls", "true");
    else params.delete("onlyGirls");

    if (newFilters.countries && newFilters.countries.length > 0) {
      params.set("countries", newFilters.countries.join(","));
    } else {
      params.delete("countries");
    }

    router.push(`?${params.toString()}`);
    setFilters(newFilters);
  };

  const resetFilters = () => {
    const emptyFilters: FilterType = {
      sport: undefined,
      level: undefined,
      onlyGirls: false,
      countries: [],
      location: undefined,
    };
    router.push(window.location.pathname);
    setFilters(emptyFilters);
  };

  return (
    <>
      {/* Bouton mobile + Sheet */}
      <Sheet>
        <SheetTrigger asChild className="fixed bottom-4 right-4 z-50 lg:hidden">
          <Button
            variant="outline"
            size="icon"
            className="size-12 rounded-full shadow-lg"
          >
            <Filter className="size-6" />
            {(filters.sport ||
              filters.level ||
              filters.onlyGirls ||
              filters.countries?.length > 0) && (
              <span className="absolute -right-1 -top-1 size-3 rounded-full bg-primary" />
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <SheetTitle>Filtres</SheetTitle>
              {(filters.sport ||
                filters.level ||
                filters.onlyGirls ||
                filters.countries?.length > 0) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="flex items-center gap-2"
                >
                  <X className="size-4" />
                  Réinitialiser
                </Button>
              )}
            </div>
            <ProductFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              showGenderFilter={userSex === "F"}
              venues={venues}
            />
          </SheetHeader>
        </SheetContent>
      </Sheet>

      {/* Layout principal */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Filtres Desktop */}
        <div className="hidden w-full lg:sticky lg:top-4 lg:block lg:h-[calc(100vh-6rem)] lg:w-64">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-medium">Filtres</h3>
            {(filters.sport ||
              filters.level ||
              filters.onlyGirls ||
              filters.countries?.length > 0) && (
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
            venues={venues}
          />
        </div>

        {/* Liste des produits */}
        <div className="flex-1">
          <ProductList products={products} userId={userId} />
          {loading && (
            <div className="mt-4 text-center text-muted-foreground">
              Chargement...
            </div>
          )}
          <div ref={loadMoreRef} className="h-10" />
        </div>
      </div>
      <ScrollToTop />
    </>
  );
}
