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
import { Filter, PlusCircle, X } from "lucide-react";
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
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState(initialProducts);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterChangeCount, setFilterChangeCount] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showCreateSuggestion, setShowCreateSuggestion] = useState(false);

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

  // Effet pour simuler un chargement progressif initial
  useEffect(() => {
    if (isInitialLoad) {
      // Petit délai pour simuler un chargement progressif, améliore l'UX
      const timer = setTimeout(() => setIsInitialLoad(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isInitialLoad]);

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

  // Vérifier si des filtres sont actifs au chargement initial et avec peu d'annonces
  useEffect(() => {
    // Vérifier si la modale a déjà été affichée dans cette session
    const hasShownModal = sessionStorage.getItem("hasShownFilterModal");

    // Vérifier si des filtres sont actifs dès le chargement
    const hasFilters =
      !!filters.sport ||
      !!filters.level ||
      filters.onlyGirls ||
      (filters.countries?.length || 0) > 0 ||
      (filters.requiredBadges?.length || 0) > 0;

    // N'afficher la modale qu'une seule fois par session si les conditions sont remplies
    if (hasFilters && initialProducts.length < 5 && !hasShownModal) {
      // Attendre un court délai pour que l'interface soit bien chargée
      const timer = setTimeout(() => {
        setShowCreateSuggestion(true);
        // Marquer la modale comme déjà affichée
        sessionStorage.setItem("hasShownFilterModal", "true");
      }, 800);

      return () => clearTimeout(timer);
    }
  }, []); // Exécuter uniquement au montage du composant

  // Gérer la fermeture de la modale de suggestion
  const handleCloseSuggestion = useCallback(() => {
    setShowCreateSuggestion(false);
    // Ne plus utiliser le sessionStorage
  }, []);

  // Fonction pour rediriger vers la création d'annonce avec les filtres présélectionnés
  const handleCreateWithFilters = useCallback(() => {
    const urlParams = new URLSearchParams();

    if (filters.sport) {
      urlParams.append("sport", filters.sport);
    }

    if (filters.level) {
      urlParams.append("level", filters.level);
    }

    let url = "/annonces/new";
    if (urlParams.toString()) {
      url += `?${urlParams.toString()}`;
    }

    router.push(url);
  }, [router, filters]);

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

    // Créer un nouvel identifiant unique pour ce changement de filtre
    const filterChangeId = Date.now().toString();
    sessionStorage.setItem("lastFilterChangeId", filterChangeId);

    // Vérifier les résultats après ce changement de filtre
    setTimeout(() => {
      // Ne procéder que si c'est toujours le changement le plus récent
      const currentChangeId = sessionStorage.getItem("lastFilterChangeId");
      if (
        currentChangeId === filterChangeId &&
        products.length < 5 &&
        hasActiveFilters()
      ) {
        // Réinitialiser le flag pour permettre à la modale de s'afficher à nouveau
        sessionStorage.removeItem("hasShownFilterModal");
        setShowCreateSuggestion(true);
      }
    }, 500);
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
          <div ref={topRef}>
            <h2 className="mb-4 text-lg font-medium">
              {t("Products.Results", "Résultats")}:{" "}
              <span className="font-normal text-muted-foreground">
                {products.length}{" "}
                {products.length === 1
                  ? t("Products.ResultsSingular", "annonce")
                  : t("Products.ResultsPlural", "annonces")}
              </span>
            </h2>
            <ProductList
              products={products}
              userId={userId}
              isLoading={isPending || isInitialLoad}
            />
          </div>
          {loading && (
            <div className="mt-4 text-center text-muted-foreground">
              {t("Common.Loading", "Chargement...")}
            </div>
          )}
          <div ref={loadMoreRef} className="h-10" />
        </div>
      </div>

      {/* Modale de suggestion de création d'annonce */}
      <Dialog
        open={showCreateSuggestion}
        onOpenChange={(open) => {
          if (!open) handleCloseSuggestion();
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              Peu d'annonces correspondent à votre recherche
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 p-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-yellow-100">
              <PlusCircle className="size-8 text-yellow-600" />
            </div>
            <p className="text-center text-base">
              Pourquoi ne pas créer votre propre annonce avec ces critères et
              attirer d'autres sportifs ?
            </p>
            <div className="mt-2 w-full space-y-3">
              <Button
                onClick={handleCreateWithFilters}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
              >
                Créer une annonce avec mes filtres
              </Button>
              <Button
                variant="outline"
                onClick={handleCloseSuggestion}
                className="w-full"
              >
                Continuer ma recherche
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ScrollToTop />
    </>
  );
}
