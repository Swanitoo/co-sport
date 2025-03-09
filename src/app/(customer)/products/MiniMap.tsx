"use client";

import { useAppTranslations } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Expand, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ProductWithMemberships } from "./list/productList.schema";

// Import dynamique du composant MapComponent
const MapComponent = dynamic(
  () => import("./list/MapComponent").then((mod) => mod.MapComponent),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-lg border">
        <Skeleton className="size-full rounded-lg" />
      </div>
    ),
  }
);

interface MiniMapProps {
  initialProducts: ProductWithMemberships[];
  userId: string;
  searchParams?: { [key: string]: string | string[] | undefined };
}

export const MiniMap = ({
  initialProducts,
  userId,
  searchParams,
}: MiniMapProps) => {
  const { t } = useAppTranslations();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Filtrer les produits qui ont des coordonnées
  const productsWithCoords = initialProducts.filter(
    (product) => product.venueLat && product.venueLng
  );

  // Filtrer les produits selon les paramètres de recherche
  const filteredProducts = productsWithCoords.filter((product) => {
    // Filtre par sport
    if (searchParams?.sport && product.sport !== searchParams.sport)
      return false;

    // Filtre par niveau
    if (searchParams?.level && product.level !== searchParams.level)
      return false;

    // Filtre par onlyGirls
    if (searchParams?.onlyGirls === "true" && product.user.sex !== "F")
      return false;

    // Filtre par pays
    if (searchParams?.countries) {
      const countries =
        typeof searchParams.countries === "string"
          ? searchParams.countries.split(",")
          : searchParams.countries;

      if (
        countries.length > 0 &&
        !countries.includes(product.user.country || "")
      )
        return false;
    }

    return true;
  });

  // S'assurer que le composant est monté côté client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || filteredProducts.length === 0) {
    return null;
  }

  return (
    <>
      <div className="relative h-40 w-full overflow-hidden rounded-xl border shadow-sm transition-all hover:shadow-md sm:size-[180px]">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-10 size-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
          onClick={() => setIsOpen(true)}
        >
          <Expand className="size-4" />
          <span className="sr-only">
            {t("Products.Map.ExpandMap", "Agrandir la carte")}
          </span>
        </Button>
        <div className="size-full">
          <MapComponent
            products={filteredProducts}
            userId={userId}
            miniVersion={true}
          />
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-[95dvh] max-w-[95dvw] overflow-hidden p-0 sm:rounded-xl">
          <DialogHeader className="absolute right-4 top-4 z-50 flex-row items-center justify-end space-x-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
            >
              <X className="size-4" />
              <span className="sr-only">
                {t("Products.Map.CloseMap", "Fermer")}
              </span>
            </Button>
            <DialogTitle className="sr-only">
              {t("Products.Map.Title", "Carte des annonces")}
            </DialogTitle>
          </DialogHeader>
          <div className="h-[95dvh] w-full">
            <MapComponent
              products={filteredProducts}
              userId={userId}
              miniVersion={false}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
