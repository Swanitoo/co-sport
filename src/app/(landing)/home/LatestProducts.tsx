"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProductCardLink } from "@/components/ui/product-card-link";
import { getCountryFlag } from "@/data/country";
import { getFirstName } from "@/lib/string-utils";
import { Globe } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  LEVEL_CLASSES,
  SPORTS,
} from "../../(customer)/annonces/[slug]/edit/product.schema";

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

// Extraire le composant ProductCard pour éviter les re-rendus inutiles
const ProductCard = memo(
  ({
    product,
    isAuthenticated,
    isHovered,
  }: {
    product: Product;
    isAuthenticated: boolean;
    isHovered: boolean;
  }) => {
    // Memoize computed values
    const productUrl = useMemo(
      () =>
        isAuthenticated
          ? `/annonces/${product.slug}`
          : `/api/auth/signin?callbackUrl=${encodeURIComponent(
              `/annonces/${product.slug}`
            )}`,
      [product.slug, isAuthenticated]
    );

    const sportIcon = useMemo(
      () =>
        SPORTS.find(
          (s) => s.name === (product.originalSportName || product.sport)
        )?.icon,
      [product.originalSportName, product.sport]
    );

    const levelIcon = useMemo(
      () =>
        LEVEL_CLASSES.find(
          (l) => l.name === (product.originalLevelName || product.level)
        )?.icon,
      [product.originalLevelName, product.level]
    );

    // Memoize the review text
    const reviewsText = useMemo(
      () =>
        product._count.reviews > 0 ? ` (${product._count.reviews} avis)` : "",
      [product._count.reviews]
    );

    const firstName = useMemo(
      () => getFirstName(product.user.name),
      [product.user.name]
    );

    const countryFlag = useMemo(
      () =>
        product.user.country ? getCountryFlag(product.user.country) : null,
      [product.user.country]
    );

    return (
      <ProductCardLink
        href={productUrl}
        className="block h-full"
        cardClassName={`h-full p-4 ${isHovered ? "bg-accent/50" : ""}`}
      >
        <div className="mb-4 flex items-center gap-3">
          <Avatar>
            <AvatarImage
              src={product.user.image || undefined}
              alt={`photo de profil de ${firstName}`}
              loading="lazy"
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
                {firstName}
                {reviewsText}
              </span>
              {countryFlag && <span className="text-base">{countryFlag}</span>}
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
    );
  }
);

ProductCard.displayName = "ProductCard";

export function LatestProducts({
  products,
  isAuthenticated,
  translations,
}: LatestProductsProps) {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);
  const isMobileRef = useRef(false);

  // Observer creation is memoized
  const setupObserver = useCallback(() => {
    // Ne pas créer l'observer si on n'est pas sur mobile
    if (!isMobileRef.current) return () => {};

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const cardElement = entry.target as HTMLDivElement;
          const cardIndex = parseInt(cardElement.dataset.cardIndex || "-1");

          if (entry.isIntersecting) {
            setHoveredCardIndex(cardIndex);
          } else if (hoveredCardIndex === cardIndex) {
            setHoveredCardIndex(null);
          }
        });
      },
      {
        threshold: 0.7, // Déclencher quand 70% de la carte est visible
      }
    );

    cardsRef.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, [hoveredCardIndex]);

  useEffect(() => {
    // Vérifier si on est sur mobile et garder cette info
    isMobileRef.current = window.innerWidth < 768;

    // Cleanup function from setupObserver
    const cleanup = setupObserver();
    return cleanup;
  }, [setupObserver]);

  // Limite des produits affichés mémorisée
  const displayedProducts = useMemo(() => products.slice(0, 6), [products]);

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
          {displayedProducts.map((product, index) => (
            <div
              key={product.id}
              ref={(el) => {
                cardsRef.current[index] = el;
              }}
              data-card-index={index}
            >
              <ProductCard
                product={product}
                isAuthenticated={isAuthenticated}
                isHovered={index === hoveredCardIndex}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
