"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Globe } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  LEVEL_CLASSES,
  SPORTS,
} from "../../(customer)/products/[productId]/edit/product.schema";

type Product = {
  id: string;
  name: string;
  sport: string;
  level: string;
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
};

export function LatestProducts({ products }: LatestProductsProps) {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);
  const isMobileRef = useRef(false);

  useEffect(() => {
    // Vérifier si on est sur mobile
    isMobileRef.current = window.innerWidth < 768;

    if (!isMobileRef.current) return;

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

  return (
    <section className="w-full">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 flex flex-col items-center space-y-4 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
            Les dernières annonces
          </h2>
          <p className="max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed">
            Découvrez les dernières activités sportives ajoutées par nos membres
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {products.slice(0, 6).map((product, index) => {
            const isHovered = index === hoveredCardIndex;

            return (
              <div
                key={product.id}
                ref={(el) => {
                  cardsRef.current[index] = el;
                }}
                data-card-index={index}
              >
                <Link href={`/products/${product.id}`} className="group block">
                  <Card
                    className={`h-full cursor-pointer p-4 transition-all duration-300 hover:bg-accent/50 ${
                      isHovered ? "bg-accent/50" : ""
                    }`}
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={product.user.image || undefined} />
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
                            {product.user.name}
                            {product._count.reviews > 0 &&
                              ` (${product._count.reviews} avis)`}
                          </span>
                          {product.user.country && (
                            <span>{product.user.country}</span>
                          )}
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
                        <span className="text-lg">
                          {SPORTS.find((s) => s.name === product.sport)?.icon}
                        </span>
                        <span className="truncate">{product.sport}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-lg">
                          {
                            LEVEL_CLASSES.find((l) => l.name === product.level)
                              ?.icon
                          }
                        </span>
                        <span>{product.level}</span>
                      </span>
                    </div>
                  </Card>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
