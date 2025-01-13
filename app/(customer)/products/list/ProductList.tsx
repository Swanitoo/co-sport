"use client";

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
      {products.map((product) => (
        <Link key={product.id} href={`/products/${product.id}`}>
          <Card className="cursor-pointer flex-col gap-2 transition-all duration-200 ease-in-out hover:scale-[1.02] hover:bg-accent/5 hover:shadow-lg">
            <CardHeader className="flex items-center gap-2 p-4">
              {product.userId === userId && (
                <Crown size={16} className="text-yellow-500" />
              )}
              {product.memberships.length > 0 && (
                <>
                  {product.memberships[0].status === "APPROVED" && (
                    <CheckCircle size={16} className="text-green-500" />
                  )}
                  {product.memberships[0].status === "PENDING" && (
                    <Hourglass size={16} className="text-yellow-500" />
                  )}
                </>
              )}
              <CardTitle>{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <CardDescription className="text-center">
                {product.sport}
              </CardDescription>
            </CardContent>
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
      ))}
    </div>
  );
}
