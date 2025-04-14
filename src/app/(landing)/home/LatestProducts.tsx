"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProductCardLink } from "@/components/ui/product-card-link";
import { getFirstName } from "@/lib/string-utils";
import { Globe } from "lucide-react";
import { memo, useMemo } from "react";
import {
  LEVEL_CLASSES,
  SPORTS,
} from "../../(customer)/products/[slug]/edit/product.schema";

type Product = {
  id: string;
  slug: string;
  name: string;
  sport: string;
  level: string;
  originalSportName?: string;
  originalLevelName?: string;
  description: string;
  venueName: string | null;
  venueAddress: string | null;
  user: {
    name: string | null;
    country: string | null;
    image: string | null;
  };
  _count: {
    reviews: number;
  };
};

type LatestProductsProps = {
  products: Product[];
  isAuthenticated: boolean;
  translations?: {
    title?: string;
    subtitle?: string;
  };
};

// Composant de carte produit optimisé avec memo
const ProductCard = memo(
  ({
    product,
    isAuthenticated,
  }: {
    product: Product;
    isAuthenticated: boolean;
  }) => {
    // Fonction pour générer le texte des avis
    const getReviewsText = (count: number) =>
      count > 0 ? ` (${count} avis)` : "";

    // Trouver l'icône du sport - memoized
    const sportIcon = useMemo(() => {
      return SPORTS.find(
        (s) => s.name === (product.originalSportName || product.sport)
      )?.icon;
    }, [product.sport, product.originalSportName]);

    // Trouver l'icône du niveau - memoized
    const levelIcon = useMemo(() => {
      return LEVEL_CLASSES.find(
        (l) => l.name === (product.originalLevelName || product.level)
      )?.icon;
    }, [product.level, product.originalLevelName]);

    return (
      <div className="product-card group transition-all duration-300 hover:scale-[1.01]">
        <ProductCardLink
          href={
            isAuthenticated
              ? `/products/${product.slug}`
              : `/api/auth/signin?callbackUrl=${encodeURIComponent(
                  `/products/${product.slug}`
                )}`
          }
          className="block h-full"
          cardClassName="h-full p-4 group-hover:bg-accent/50 transition-colors duration-300"
        >
          <div className="mb-4 flex items-center gap-3">
            <Avatar>
              <AvatarImage
                src={product.user.image || undefined}
                alt={`Photo de profil de ${product.user.name || "utilisateur"}`}
              />
              <AvatarFallback>
                {product.user.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="line-clamp-1 truncate font-medium">
                {product.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  {getFirstName(product.user.name)}
                  {getReviewsText(product._count.reviews)}
                </span>
                {product.user.country && <span>{product.user.country}</span>}
              </div>
            </div>
          </div>
          {(product.venueName || product.venueAddress) && (
            <div className="mb-3 flex items-center gap-1 text-sm text-muted-foreground">
              <Globe className="size-4" />
              <span className="truncate">
                {product.venueName || product.venueAddress}
              </span>
            </div>
          )}
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
            {product.description}
          </p>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="text-lg">{sportIcon}</span>
              <span className="truncate">{product.sport}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-lg">{levelIcon}</span>
              <span>{product.level}</span>
            </span>
          </div>
        </ProductCardLink>
      </div>
    );
  }
);

ProductCard.displayName = "ProductCard";

// Composant principal optimisé avec memo
export const LatestProducts = memo(
  ({ products, isAuthenticated, translations }: LatestProductsProps) => {
    return (
      <section className="w-full">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 flex flex-col items-center space-y-4 text-center">
            <h3 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              {translations?.title || "Les dernières annonces"}
            </h3>
            <p className="max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed">
              {translations?.subtitle ||
                "Découvrez les dernières activités sportives ajoutées par nos membres"}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {products.slice(0, 6).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }
);

LatestProducts.displayName = "LatestProducts";
