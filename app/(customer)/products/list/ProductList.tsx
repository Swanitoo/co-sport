"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { COUNTRIES } from "@/data/country";
import { CheckCircle, Crown, Hourglass } from "lucide-react";
import Link from "next/link";
import { LEVEL_CLASSES, SPORTS } from "../[productId]/edit/product.schema";
import { ProductListProps } from "./productList.schema";

export function ProductSkeleton() {
  return (
    <Card className="cursor-pointer flex-col gap-2">
      <CardHeader className="flex flex-col items-center gap-2 p-4">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent className="space-y-1.5 flex flex-col items-center gap-2 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-16" />
      </CardContent>
      <CardContent className="p-4 text-center">
        <Skeleton className="h-4 w-32 mx-auto" />
      </CardContent>
      <CardContent className="p-4 text-center">
        <Skeleton className="h-4 w-20 mx-auto" />
      </CardContent>
    </Card>
  );
}

export function ProductList({ products, userId, isLoading }: ProductListProps & { isLoading?: boolean }) {
  const getSportIcon = (sportName: string) => {
    const sport = SPORTS.find(s => s.name === sportName);
    return sport?.icon || "🎯";
  };

  const getLevelIcon = (levelName: string) => {
    const level = LEVEL_CLASSES.find(l => l.name === levelName);
    return level?.icon || "🎯";
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product, index) => {
        const isOwner = product.userId === userId;
        const membership = product.memberships.find(m => m.userId === userId);
        const isApprovedMember = !isOwner && membership?.status === "APPROVED";
        const isPendingMember = !isOwner && membership?.status === "PENDING";
        const countryFlag = product.user.country ? COUNTRIES.find(c => c.code === product.user.country)?.flag : null;

        return (
          <Link key={`product-${product.id}-${index}`} href={`/products/${product.id}`}>
            <Card className="cursor-pointer flex-col gap-2 transition-all duration-200 ease-in-out hover:scale-[1.02] hover:bg-accent/5 hover:shadow-lg">
              <CardHeader className="flex flex-col items-center gap-2 p-4">
                <div className="flex items-center gap-2 w-full">
                  <div className="flex items-center gap-1">
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
                  <CardTitle className="text-center flex-1 truncate">{product.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-1.5 flex flex-col items-center gap-2 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={product.user.image || undefined} />
                    <AvatarFallback>{product.user.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                    {product.user.name?.split(' ')[0]}
                    {countryFlag && (
                      <span className="ml-1">{countryFlag}</span>
                    )}
                  </span>
                </div>
                <CardDescription className="text-center flex items-center gap-2 justify-center">
                  <span className="text-xl">{getSportIcon(product.sport)}</span>
                  <span>{product.sport}</span>
                </CardDescription>
              </CardContent>
              {(product.venueName || product.venueAddress) && (
                <CardContent className="text-center text-sm text-muted-foreground truncate px-4">
                  <span>{product.venueName || product.venueAddress}</span>
                </CardContent>
              )}
              <CardContent className="p-4 text-center">
                <p className="truncate w-full text-sm text-muted-foreground">
                  {product.description}
                </p>
              </CardContent>
              <CardContent className="p-4 text-center">
                <p className="truncate w-full text-sm font-medium flex items-center gap-2 justify-center">
                  <span className="text-xl">{getLevelIcon(product.level)}</span>
                  <span>{product.level}</span>
                </p>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
