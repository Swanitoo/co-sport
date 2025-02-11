import { requiredCurrentUser } from "@/auth/current-user";
import { Layout, LayoutTitle } from "@/components/layout";
import { prisma } from "@/prisma";
import type { PageParams } from "@/types/next";
import { notFound } from "next/navigation";
import { ProductForm } from "./ProductForm";

export default async function RoutePage(
  props: PageParams<{
    productId: string;
  }>
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
      <LayoutTitle>Edit product</LayoutTitle>
      <ProductForm
        defaultValues={transformedProduct}
        productId={product.id}
        userSex={user.sex ?? undefined}
      />
    </Layout>
  );
}
