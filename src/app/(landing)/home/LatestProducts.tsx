"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { getCountryFlag } from "@/data/country";
import { Globe } from "lucide-react";
import { useRouter } from "next/navigation";
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
  isAuthenticated: boolean;
};

export const LatestProducts = ({
  products,
  isAuthenticated,
}: LatestProductsProps) => {
  const router = useRouter();

  const handleProductClick = (productId: string) => {
    if (isAuthenticated) {
      router.push(`/products/${productId}`);
    } else {
      router.push(
        `/api/auth/signin?callbackUrl=http://localhost:3000/products/${productId}`,
      );
    }
  };

  return (
    <div className="container py-8">
      <div>
        <h2 className="mb-4 text-2xl font-bold">Dernières annonces</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {products.slice(0, 6).map((product) => (
            <Card
              key={product.id}
              className="cursor-pointer p-4 transition-colors hover:bg-accent/50"
              onClick={() => handleProductClick(product.id)}
            >
              <div className="mb-4 flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={product.user.image || undefined} />
                  <AvatarFallback>
                    {product.user.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="line-clamp-1 font-medium">{product.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>
                      {product.user.name}
                      {product._count.reviews > 0 &&
                        ` (${product._count.reviews})`}
                    </span>
                    {product.user.country && (
                      <span>{getCountryFlag(product.user.country)}</span>
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
              <p className="mb-3 truncate text-sm text-muted-foreground">
                {product.description}
              </p>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  {SPORTS.find((s) => s.name === product.sport)?.icon}{" "}
                  {product.sport}
                </span>
                <span className="flex items-center gap-1">
                  {LEVEL_CLASSES.find((l) => l.name === product.level)?.icon}{" "}
                  {product.level}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
