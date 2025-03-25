"use client";

import { useAppTranslations } from "@/components/i18n-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { COUNTRIES } from "@/data/country";
import { CheckCircle, Crown, Globe, Hourglass } from "lucide-react";
import Link from "next/link";
import { LEVEL_CLASSES, SPORTS } from "../[slug]/edit/product.schema";
import { ProductListProps } from "./productList.schema";

export function ProductSkeleton() {
  return (
    <Card className="cursor-pointer flex-col gap-2">
      <div className="p-4">
        <Skeleton className="h-4 w-24" />
        <div className="mb-2 mt-4 flex items-center gap-2">
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="mt-4 h-4 w-16" />
        <Skeleton className="mt-4 h-4 w-32" />
        <div className="mt-4 flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </Card>
  );
}

export function ProductList({
  products,
  userId,
  isLoading,
}: ProductListProps & { isLoading?: boolean }) {
  const { locale } = useAppTranslations();

  const getSportIcon = (sportName: string) => {
    const sport = SPORTS.find((s) => s.name === sportName);
    return sport?.icon || "🎯";
  };

  const getLevelIcon = (levelName: string) => {
    const level = LEVEL_CLASSES.find((l) => l.name === levelName);
    return level?.icon || "🎯";
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product, index) => {
        const isOwner = product.userId === userId;
        const membership = product.memberships.find((m) => m.userId === userId);
        const isApprovedMember = !isOwner && membership?.status === "APPROVED";
        const isPendingMember = !isOwner && membership?.status === "PENDING";
        const countryFlag = product.user.country
          ? COUNTRIES.find((c) => c.code === product.user.country)?.flag
          : null;

        return (
          <Link
            key={`product-${product.id}-${index}`}
            href={`/${locale}/products/${product.slug}`}
          >
            <Card className="cursor-pointer p-4 transition-colors hover:bg-accent/50">
              <div className="mb-4 flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={product.user.image || undefined} />
                  <AvatarFallback>
                    {product.user.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <h3 className="max-w-[150px] truncate font-medium">
                      {product.name}
                    </h3>
                    <div className="shrink-0">
                      {isOwner && (
                        <Crown size={16} className="text-yellow-500" />
                      )}
                      {isApprovedMember && (
                        <CheckCircle size={16} className="text-green-500" />
                      )}
                      {isPendingMember && (
                        <Hourglass size={16} className="text-yellow-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="truncate">
                      {product.user.name}
                      {product.user.sex && (
                        <span className="ml-1">({product.user.sex})</span>
                      )}
                    </span>
                    {countryFlag && (
                      <span className="shrink-0">{countryFlag}</span>
                    )}
                  </div>
                </div>
              </div>

              {(product.venueName || product.venueAddress) && (
                <div className="mb-3 flex items-center gap-1 text-sm text-muted-foreground">
                  <Globe className="size-4 shrink-0" />
                  <span className="truncate">
                    {product.venueName || product.venueAddress}
                  </span>
                </div>
              )}

              <p className="mb-3 line-clamp-1 text-sm text-muted-foreground">
                {product.description}
              </p>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="flex max-w-[50%] items-center gap-1 truncate">
                  <span className="shrink-0">
                    {getSportIcon(product.sport)}
                  </span>{" "}
                  {product.sport}
                </span>
                <span className="flex max-w-[50%] items-center gap-1 truncate">
                  <span className="shrink-0">
                    {getLevelIcon(product.level)}
                  </span>{" "}
                  {product.level}
                </span>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
