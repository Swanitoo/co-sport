import { requiredCurrentUser } from "@/auth/current-user";
import { Layout, LayoutTitle } from "@/components/layout";
import { prisma } from "@/prisma";
import type { PageParams } from "@/types/next";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "./ProductForm";

export default async function RoutePage(
  props: PageParams<{
    productId: string;
  }>,
) {
  const user = await requiredCurrentUser();

  const product = await prisma.product.findUnique({
    where: {
      id: props.params.productId,
    },
  });

  if (!product || (!user.isAdmin && product.userId !== user.id)) {
    notFound();
  }

  const transformedProduct = {
    ...product,
    onlyGirls: false,
    venueName: product.venueName ?? undefined,
    venueAddress: product.venueAddress ?? undefined,
    venueLat: product.venueLat ?? undefined,
    venueLng: product.venueLng ?? undefined,
  };

  return (
    <Layout>
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/home" className="hover:text-foreground">
          <Home className="size-4" />
        </Link>
        <ChevronRight className="size-4" />
        <Link href="/products" className="hover:text-foreground">
          Annonces
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground">Créer une annonce</span>
      </div>
      <LayoutTitle>Créer une annonce</LayoutTitle>
      <ProductForm
        defaultValues={transformedProduct}
        productId={product.id}
        userSex={user.sex ?? undefined}
      />
    </Layout>
  );
}
