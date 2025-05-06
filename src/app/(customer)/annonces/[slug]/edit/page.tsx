import { requiredCurrentUser } from "@/auth/current-user";
import { Layout, LayoutTitle } from "@/components/layout";
import { getServerTranslations } from "@/components/server-translation";
import { prisma } from "@/prisma";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "./ProductForm";

export default async function RoutePage(
  props: {
    params: Promise<{ slug: string }>;
  }
) {
  const params = await props.params;
  const { t, locale } = await getServerTranslations();
  const user = await requiredCurrentUser();

  // Si le slug est undefined, rediriger vers 404
  if (!params.slug) {
    console.error("Slug est undefined dans la page d'édition");
    notFound();
  }

  // Rechercher le produit par slug
  const product = await prisma.product.findUnique({
    where: {
      slug: params.slug,
    },
  });

  if (!product || (!user.isAdmin && product.userId !== user.id)) {
    notFound();
  }

  const transformedProduct = {
    ...product,
    onlyGirls: product.onlyGirls ?? false,
    venueName: product.venueName ?? undefined,
    venueAddress: product.venueAddress ?? undefined,
    venueLatitude: product.venueLat ?? undefined,
    venueLongitude: product.venueLng ?? undefined,
  };

  return (
    <Layout>
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={`/${locale}/home`} className="hover:text-foreground">
          <Home className="size-4" />
        </Link>
        <ChevronRight className="size-4" />
        <Link href={`/${locale}/annonces`} className="hover:text-foreground">
          {t("Products.Title", "Annonces")}
        </Link>
        <ChevronRight className="size-4" />
        <Link
          href={`/${locale}/annonces/${product.slug}`}
          className="hover:text-foreground"
        >
          {product.name}
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground">
          {t("Products.Edit", "Modifier")}
        </span>
      </div>
      <LayoutTitle>{t("Products.EditTitle", "Modifier l'annonce")}</LayoutTitle>
      <ProductForm
        defaultValues={transformedProduct}
        productId={product.id}
        userSex={user.sex ?? undefined}
      />
    </Layout>
  );
}
