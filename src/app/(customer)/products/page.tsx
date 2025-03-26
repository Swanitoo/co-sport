import { currentUser } from "@/auth/current-user";
import { Layout, LayoutTitle } from "@/components/layout";
import { getServerTranslations } from "@/components/server-translation";
import { buttonVariants } from "@/components/ui/button";
import { generateMetadata as createSeoMetadata } from "@/lib/seo-config";
import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  FilteredProductList,
  ProductListFallback,
} from "./list/FilteredProductList";
import {
  getFilteredProducts,
  getUniqueVenues,
} from "./list/productList.actions";
import { FilterType } from "./list/productList.schema";
import { MiniMap } from "./MiniMap";

// Activation de l'ISR pour cette page
export const dynamic = "force-dynamic"; // Valeur possible: 'auto' | 'force-dynamic' | 'error' | 'force-static'
export const revalidate = 60; // Revalider toutes les 60 secondes

export default async function RoutePage(
  props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  }
) {
  const searchParams = await props.searchParams;
  const user = await currentUser();
  const { t } = await getServerTranslations();

  if (!user) {
    redirect("/auth/signin");
  }

  const isAdmin = user.isAdmin ?? false;

  // Construire les filtres initiaux basés sur les paramètres de l'URL
  const initialFilters: FilterType = {
    sport:
      typeof searchParams.sport === "string" ? searchParams.sport : undefined,
    level:
      typeof searchParams.level === "string" ? searchParams.level : undefined,
    onlyGirls: searchParams.onlyGirls === "true",
    countries:
      typeof searchParams.countries === "string"
        ? searchParams.countries.split(",").filter(Boolean)
        : [],
    venue:
      typeof searchParams.venue === "string" ? searchParams.venue : undefined,
    requiredBadges:
      typeof searchParams.badges === "string"
        ? searchParams.badges.split(",").filter(Boolean)
        : [],
  };

  // Utilisation de Promise.all pour paralléliser les requêtes et réduire le temps de chargement
  const [initialProducts, venues] = await Promise.all([
    // Utiliser getFilteredProducts pour appliquer tous les filtres dès le chargement initial
    getFilteredProducts(initialFilters, user.sex),
    getUniqueVenues(),
  ]);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <LayoutTitle>{t("Products.Title", "Annonces")}</LayoutTitle>
              <p className="text-muted-foreground">
                {t(
                  "Products.Description",
                  "Trouve ton partenaire de sport et progressez ensemble !"
                )}
              </p>

              <Link
                href="/products/new"
                className={buttonVariants({ variant: "default" })}
              >
                <Plus className="mr-2 size-4" />
                {t("Products.Create", "Créer une annonce")}
              </Link>
            </div>

            <div className="mt-4 sm:mt-0">
              <Suspense
                fallback={
                  <div className="h-[200px] w-full animate-pulse rounded-md bg-muted"></div>
                }
              >
                <MiniMap
                  initialProducts={initialProducts}
                  userId={user.id}
                  searchParams={searchParams}
                />
              </Suspense>
            </div>
          </div>
        </div>

        <Suspense fallback={<ProductListFallback />}>
          <FilteredProductList
            initialProducts={initialProducts}
            userSex={user.sex}
            userId={user.id}
            venues={venues}
            isAdmin={isAdmin}
            searchParams={searchParams}
          />
        </Suspense>
      </div>
    </Layout>
  );
}

// Génération de métadonnées SEO pour la page de produits
export async function generateMetadata(): Promise<Metadata> {
  return createSeoMetadata({
    title: "Toutes les annonces sportives | co-sport.com",
    description:
      "Découvrez toutes les annonces sportives disponibles. Trouvez des partenaires pour tous types de sports dans votre région.",
    path: "/products",
  });
}
