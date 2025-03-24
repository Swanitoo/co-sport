"use client";

import { useAppTranslations } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollToTop } from "@/components/ui/scrollTotop";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { ProductFilters } from "./ProductFilters";
import { ProductList } from "./ProductList";
import { fetchMoreProducts } from "./productList.actions";
import { FilteredProductListProps, FilterType } from "./productList.schema";

// Composant de secours pendant le chargement
export function ProductListFallback() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-8 w-[150px]" />
        <Skeleton className="h-8 w-[100px]" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-[300px] w-full rounded-lg" />
          ))}
      </div>
    </div>
  );
}

export function FilteredProductList({
  initialProducts,
  userSex,
  userId,
  venues,
  isAdmin,
  searchParams: initialSearchParams,
}: FilteredProductListProps) {
  const { t } = useAppTranslations();
  const [isPending, startTransition] = useTransition();
  const [hasMore, setHasMore] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const loadMoreRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState(initialProducts);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterChangeCount, setFilterChangeCount] = useState(0);

  // Extraire les valeurs des paramètres d'URL pour les filtres de performance
  const getNumberParam = (param: string): number | undefined => {
    const value = searchParams?.get(param);
    return value ? parseInt(value) : undefined;
  };

  const [filters, setFilters] = useState<FilterType>({
    sport: searchParams?.get("sport") || undefined,
    level: searchParams?.get("level") || undefined,
    onlyGirls: searchParams?.get("onlyGirls") === "true",
    countries: searchParams?.get("countries")?.split(",").filter(Boolean) || [],
    location: undefined,
    // Initialiser les filtres de badges
    requiredBadges:
      searchParams?.get("badges")?.split(",").filter(Boolean) || [],
  });

  const applyFilters = useCallback(
    (products: any[]) => {
      // Les produits sont déjà filtrés par le serveur selon les filtres d'URL
      // La filtration JavaScript n'est nécessaire que pour les changements de filtre locaux
      return products.filter((product) => {
        // Filtres existants
        if (filters.sport && product.sport !== filters.sport) return false;
        if (filters.level && product.level !== filters.level) return false;
        if (
          filters.countries?.length > 0 &&
          (!product.user.country ||
            !filters.countries.includes(product.user.country))
        )
          return false;
        if (userSex === "F" && filters.onlyGirls && product.user.sex !== "F")
          return false;
        if (
          filters.venue &&
          product.venueName !== filters.venue &&
          product.venueAddress !== filters.venue
        )
          return false;

        // Pour les badges, le filtrage est déjà fait côté serveur
        // via getFilteredProducts, donc pas besoin de filtrer ici

        return true;
      });
    },
    [filters, userSex]
  );

  // Utiliser useCallback pour mémoriser la fonction et éviter des re-rendus inutiles
  const loadMoreProducts = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const skip = products.length;
      const newProducts = await fetchMoreProducts(skip, filters, userSex);

      if (newProducts.length < 10) {
        setHasMore(false);
      }

      const filteredNewProducts = applyFilters(newProducts);
      setProducts((prev) => [...prev, ...filteredNewProducts]);
    } catch (error) {
      console.error("Erreur lors du chargement des produits:", error);
    } finally {
      setLoading(false);
    }
  }, [applyFilters, filters, hasMore, loading, products.length, userSex]);

  // Appliquer les filtres lorsqu'ils changent
  useEffect(() => {
    startTransition(() => {
      const filteredProducts = applyFilters(initialProducts);
      setProducts(filteredProducts);
      setHasMore(filteredProducts.length >= 10);
    });
  }, [applyFilters, filterChangeCount, initialProducts]);

  // Observer l'élément pour charger plus de produits
  useEffect(() => {
    const currentRef = loadMoreRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          loadMoreProducts();
        }
      },
      { threshold: 0.1 }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, loading, loadMoreProducts]);

  // Fonction de mise à jour des filtres y compris les filtres de performance
  const handleFilterChange = (newFilters: FilterType) => {
    const params = new URLSearchParams(searchParams?.toString());

    // Paramètres existants
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

    // Paramètres de badges
    if (newFilters.requiredBadges && newFilters.requiredBadges.length > 0) {
      params.set("badges", newFilters.requiredBadges.join(","));
    } else {
      params.delete("badges");
    }

    router.push(`?${params.toString()}`);
    setFilters(newFilters);
    setFilterChangeCount((prev) => prev + 1); // Incrémente le compteur pour déclencher l'effet
  };

  // Fonction de réinitialisation des filtres
  const resetFilters = () => {
    const emptyFilters: FilterType = {
      sport: undefined,
      level: undefined,
      onlyGirls: false,
      countries: [],
      location: undefined,
      // Réinitialiser les filtres de badges
      requiredBadges: [],
    };
    router.push(window.location.pathname);
    setFilters(emptyFilters);
    setFilterChangeCount((prev) => prev + 1); // Incrémente le compteur pour déclencher l'effet
  };

  // Vérifier si des filtres sont actifs
  const hasActiveFilters = useCallback(() => {
    return (
      !!filters.sport ||
      !!filters.level ||
      filters.onlyGirls ||
      (filters.countries?.length || 0) > 0 ||
      (filters.requiredBadges?.length || 0) > 0
    );
  }, [filters]);

  return (
    <>
      {hasActiveFilters() && (
        <div className="mb-4 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="flex items-center gap-2 lg:hidden"
          >
            <X className="size-4" />
            {t("Products.Filters.Reset", "Réinitialiser les filtres")}
          </Button>
        </div>
      )}

      <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
        <DialogTrigger asChild className="fixed bottom-4 left-4 z-50 lg:hidden">
          <Button
            variant="outline"
            size="icon"
            className="size-12 rounded-full shadow-lg transition-all duration-300"
            onClick={() => setFiltersOpen(true)}
          >
            <Filter className="size-6" />
            {hasActiveFilters() && (
              <span className="absolute -right-1 -top-1 size-3 rounded-full bg-primary" />
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="h-[80vh] w-full max-w-[95vw] overflow-hidden sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                {t("Products.Filters.Title", "Filtres")}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {t(
                  "Products.Filters.Description",
                  "Filtrer les annonces par sport, niveau, et autres critères"
                )}
              </DialogDescription>
              {hasActiveFilters() && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    resetFilters();
                    setFiltersOpen(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <X className="size-4" />
                  {t("Products.Filters.Reset", "Réinitialiser")}
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
                setFiltersOpen(false);
              }}
            >
              {t("Products.Filters.Apply", "Appliquer les filtres")}
            </Button>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="hidden w-full lg:sticky lg:top-4 lg:block lg:h-[calc(100vh-6rem)] lg:w-64">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-medium">
              {t("Products.Filters.Title", "Filtres")}
            </h3>
            {hasActiveFilters() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="flex items-center gap-2"
              >
                <X className="size-4" />
                {t("Products.Filters.Reset", "Réinitialiser les filtres")}
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

        <div className="flex-1">
          <ProductList products={products} userId={userId} />
          {loading && (
            <div className="mt-4 text-center text-muted-foreground">
              {t("Common.Loading", "Chargement...")}
            </div>
          )}
          <div ref={loadMoreRef} className="h-10" />
        </div>
      </div>
      <ScrollToTop />
    </>
  );
}
