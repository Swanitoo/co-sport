"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollToTop } from "@/components/ui/scrollTotop";
import { Filter, Loader2, Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ProductFilters } from "./ProductFilters";
import { ProductList } from "./ProductList";
import { fetchMoreProducts, getFilteredProducts } from "./productList.actions";
import { FilteredProductListProps, FilterType } from "./productList.schema";

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
  const [isCreating, setIsCreating] = useState(false);

  const [filters, setFilters] = useState<FilterType>({
    sport: searchParams?.get("sport") || undefined,
    level: searchParams?.get("level") || undefined,
    onlyGirls: searchParams?.get("onlyGirls") === "true",
    countries: searchParams?.get("countries")?.split(",") || [],
    location: undefined,
  });

  const fetchFilteredProducts = async () => {
    setLoading(true);
    try {
      const filteredProducts = await getFilteredProducts(filters, userSex);
      setProducts(filteredProducts);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des produits filtrés:",
        error,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredProducts();
  }, [filters, userSex]);

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
      { threshold: 1.0 },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [products.length, loading, filters, hasMore]);

  const handleFilterChange = (newFilters: FilterType) => {
    const params = new URLSearchParams(searchParams?.toString());

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
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/products/new"
          className={buttonVariants({
            size: "lg",
            className: "gap-2",
          })}
          onClick={() => setIsCreating(true)}
        >
          {isCreating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          Créer une annonce
        </Link>

        {(filters.sport ||
          filters.level ||
          filters.onlyGirls ||
          filters.countries?.length > 0) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="flex items-center gap-2 lg:hidden"
          >
            <X className="size-4" />
            Réinitialiser les filtres
          </Button>
        )}
      </div>

      {/* Bouton mobile + Dialog */}
      <Dialog>
        <DialogTrigger asChild className="fixed bottom-4 left-4 z-50 lg:hidden">
          <Button
            variant="outline"
            size="icon"
            className="size-12 rounded-full shadow-lg transition-all duration-300"
          >
            <Filter className="size-6" />
            {(filters.sport ||
              filters.level ||
              filters.onlyGirls ||
              filters.countries?.length > 0) && (
              <span className="absolute -right-1 -top-1 size-3 rounded-full bg-primary" />
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="h-[80vh] w-full max-w-[95vw] overflow-hidden sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Filtres</DialogTitle>
              <DialogDescription className="sr-only">
                Filtrer les annonces par sport, niveau, et autres critères
              </DialogDescription>
              {(filters.sport ||
                filters.level ||
                filters.onlyGirls ||
                filters.countries?.length > 0) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    resetFilters();
                    const dialogTrigger =
                      document.querySelector('[role="dialog"]');
                    if (dialogTrigger) {
                      (dialogTrigger as HTMLElement).click();
                    }
                  }}
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
              className="max-h-[calc(80vh-10rem)] overflow-y-auto"
            />
            <Button
              className="mt-4 w-full"
              onClick={() => {
                const dialogTrigger = document.querySelector('[role="dialog"]');
                if (dialogTrigger) {
                  (dialogTrigger as HTMLElement).click();
                }
              }}
            >
              Appliquer les filtres
            </Button>
          </DialogHeader>
        </DialogContent>
      </Dialog>

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
