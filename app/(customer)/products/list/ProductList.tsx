"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Crown, Hourglass } from "lucide-react";
import Link from "next/link";
import { ProductListProps } from "./productList.schema";

export function ProductList({ products, userId }: ProductListProps) {
  return (
    <div className="flex flex-col gap-2 space-y-4">
      {products.map((product) => {
        const isOwner = product.userId === userId;
        const membership = product.memberships.find(m => m.userId === userId);
        const isApprovedMember = !isOwner && membership?.status === "APPROVED";
        const isPendingMember = !isOwner && membership?.status === "PENDING";

        return (
          <Link key={product.id} href={`/products/${product.id}`}>
            <Card className="cursor-pointer flex-col gap-2 transition-all duration-200 ease-in-out hover:scale-[1.02] hover:bg-accent/5 hover:shadow-lg">
              <CardHeader className="flex flex-col items-center gap-2 p-4">
                <div className="flex items-center gap-2">
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
                <CardTitle className="text-center">{product.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 flex flex-col items-center gap-2 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={product.user.image || undefined} />
                    <AvatarFallback>{product.user.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">{product.user.name}</span>
                </div>
                <CardDescription className="text-center">
                  {product.sport}
                </CardDescription>
              </CardContent>
              {(product.venueName || product.venueAddress) && (
                <CardContent className="line-clamp-2 text-center text-sm text-muted-foreground">
                  <span>{product.venueName}</span>
                </CardContent>
              )}
              <CardContent className="p-4 text-center">
                <p className="truncate-multiline font-mono">
                  {product.description}
                </p>
              </CardContent>
              <CardContent className="p-4 text-center">
                <p className="overflow-hidden text-ellipsis font-mono">
                  {product.level}
                </p>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
