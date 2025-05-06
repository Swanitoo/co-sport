"use client";

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
import { ProductWithMemberships } from "../list/productList.schema";

// Import dynamique du composant MapComponent
const MapComponent = dynamic(
  () => import("../list/MapComponent").then((mod) => mod.MapComponent),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-lg border">
        <Skeleton className="size-full rounded-lg" />
      </div>
    ),
  }
);

interface ProductLocationMapProps {
  product: {
    id: string;
    name: string;
    description: string;
    sport: string;
    level: string;
    venueName?: string | null;
    venueAddress?: string | null;
    venueLat?: number | null;
    venueLng?: number | null;
    user: {
      name: string | null;
      image: string | null;
      sex: string | null;
      country: string | null;
    };
  };
  userId: string;
}

export const ProductLocationMap = ({
  product,
  userId,
}: ProductLocationMapProps) => {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Vérifier si le produit a des coordonnées
  const hasCoordinates = product.venueLat && product.venueLng;

  // S'assurer que le composant est monté côté client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !hasCoordinates) {
    return null;
  }

  // Convertir le produit au format attendu par MapComponent
  const mappedProduct: ProductWithMemberships = {
    id: product.id,
    name: product.name,
    description: product.description,
    sport: product.sport,
    level: product.level,
    venueName: product.venueName || null,
    venueAddress: product.venueAddress || null,
    venueLat: product.venueLat || null,
    venueLng: product.venueLng || null,
    user: {
      id: "", // Non utilisé pour l'affichage de la carte
      name: product.user.name,
      image: product.user.image,
      sex: product.user.sex,
      country: product.user.country,
    },
    userId: "", // Non utilisé pour l'affichage de la carte
    createdAt: new Date(), // Non utilisé pour l'affichage de la carte
    updatedAt: new Date(), // Non utilisé pour l'affichage de la carte
    enabled: true, // Non utilisé pour l'affichage de la carte
    slug: "", // Non utilisé pour l'affichage de la carte
    onlyGirls: false, // Non utilisé pour l'affichage de la carte
    memberships: [], // Non utilisé pour l'affichage de la carte
  };

  return (
    <>
      <div className="relative mb-4 mt-2 h-32 w-full overflow-hidden rounded-xl border shadow-sm transition-all hover:shadow-md sm:h-36">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-10 size-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
          onClick={() => setIsOpen(true)}
        >
          <Expand className="size-4" />
          <span className="sr-only">Agrandir la carte</span>
        </Button>
        <div className="size-full">
          <MapComponent
            products={[mappedProduct]}
            userId={userId}
            miniVersion={true}
            highlightSingleProduct={true}
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
              <span className="sr-only">Fermer</span>
            </Button>
            <DialogTitle className="sr-only">
              Localisation de {product.name}
            </DialogTitle>
          </DialogHeader>
          <div className="h-[95dvh] w-full">
            <MapComponent
              products={[mappedProduct]}
              userId={userId}
              miniVersion={false}
              highlightSingleProduct={true}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
