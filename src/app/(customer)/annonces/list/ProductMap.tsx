"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ProductWithMemberships } from "./productList.schema";

// Import dynamique uniquement pour éviter les erreurs de SSR
const MapComponent = dynamic(
  () => import("./MapComponent").then((mod) => mod.MapComponent),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-lg border">
        <Skeleton className="h-[calc(100vh-20rem)] w-full rounded-lg" />
      </div>
    ),
  }
);

// Types pour notre composant
interface ProductMapProps {
  products: ProductWithMemberships[];
  userId: string;
}

export const ProductMap = ({ products, userId }: ProductMapProps) => {
  const [mounted, setMounted] = useState(false);

  // Filtrer les produits qui ont des coordonnées
  const productsWithCoords = products.filter(
    (product) => product.venueLat && product.venueLng
  );

  // S'assurer que le composant est monté côté client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="rounded-lg border">
        <Skeleton className="h-[calc(100vh-20rem)] w-full rounded-lg" />
      </div>
    );
  }

  // Si aucun produit avec coordonnées
  if (productsWithCoords.length === 0) {
    return (
      <Card className="flex h-[calc(100vh-20rem)] items-center justify-center">
        <div className="text-center">
          <MapPin className="mx-auto mb-2 size-8 text-muted-foreground" />
          <h3 className="text-lg font-medium">Aucun lieu sur la carte</h3>
          <p className="text-sm text-muted-foreground">
            Aucune annonce avec des coordonnées géographiques n'a été trouvée
          </p>
        </div>
      </Card>
    );
  }

  return <MapComponent products={productsWithCoords} userId={userId} />;
};
