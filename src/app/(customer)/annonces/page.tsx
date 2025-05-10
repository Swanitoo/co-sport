import { currentUser } from "@/auth/current-user";
import { Layout, LayoutTitle } from "@/components/layout";
import { getServerTranslations } from "@/components/server-translation";
import { Button } from "@/components/ui/button";
import { generateMetadata as createSeoMetadata } from "@/lib/seo-config";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CreateProductButton } from "./CreateProductButton";
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

// Composant pour le contenu principal qui charge les données
async function AnnouncementsContent({
  searchParams,
  userSex,
  userId,
  isAdmin,
  hasUser,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
  userSex: string | null;
  userId: string;
  isAdmin: boolean;
  hasUser: boolean;
}) {
  const { t } = await getServerTranslations();

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
    getFilteredProducts(initialFilters, userSex),
    getUniqueVenues(),
  ]);

  return (
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

            {/* N'afficher le bouton de création que si l'utilisateur est connecté si non afficher le bouton de connexion */}
            {hasUser ? (
              <CreateProductButton />
            ) : (
              <Link href="/login" prefetch={true}>
                <Button>
                  {t("Auth.SignIn", "Connectez-vous pour créer une annonce")}
                </Button>
              </Link>
            )}
          </div>

          <div className="mt-4 sm:mt-0">
            <Suspense
              fallback={
                <div className="h-[200px] w-full animate-pulse rounded-md bg-muted"></div>
              }
            >
              <MiniMap
                initialProducts={initialProducts}
                userId={userId}
                searchParams={searchParams}
              />
            </Suspense>
          </div>
        </div>
      </div>

      <Suspense fallback={<ProductListFallback />}>
        <FilteredProductList
          initialProducts={initialProducts}
          userSex={userSex}
          userId={userId}
          venues={venues}
          isAdmin={isAdmin}
          searchParams={searchParams}
        />
      </Suspense>
    </div>
  );
}

// Composant de page principal
export default async function RoutePage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const user = await currentUser();

  // Supprimer la redirection - permettre l'accès même sans être connecté
  const isAdmin = user?.isAdmin ?? false;
  const userSex = user?.sex ?? null;
  const userId = user?.id ?? "";
  const hasUser = !!user;

  return (
    <Layout>
      <Suspense
        fallback={
          <div className="space-y-6">
            <div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="h-8 w-40 animate-pulse rounded-md bg-muted"></div>
                  <div className="mt-2 h-4 w-72 animate-pulse rounded-md bg-muted"></div>
                  <div className="mt-4 h-10 w-48 animate-pulse rounded-md bg-muted"></div>
                </div>
                <div className="mt-4 h-[200px] w-[300px] animate-pulse rounded-md bg-muted sm:mt-0"></div>
              </div>
            </div>
            <ProductListFallback />
          </div>
        }
      >
        <AnnouncementsContent
          searchParams={searchParams}
          userSex={userSex}
          userId={userId}
          isAdmin={isAdmin}
          hasUser={hasUser}
        />
      </Suspense>
    </Layout>
  );
}

// Génération de métadonnées SEO pour la page de produits
export async function generateMetadata(): Promise<Metadata> {
  return createSeoMetadata({
    title: "Toutes les annonces sportives | co-sport.com",
    description:
      "Découvrez toutes les annonces sportives disponibles. Trouvez des partenaires pour tous types de sports dans votre région.",
    path: "/annonces",
  });
}
