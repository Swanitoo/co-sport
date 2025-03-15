import { currentUser } from "@/auth/current-user";
import { Layout, LayoutTitle } from "@/components/layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/features/layout/Header";
import { generateMetadata as createSeoMetadata } from "@/lib/seo-config";
import { prisma } from "@/prisma";
import { ChevronRight, Home, Star } from "lucide-react";
import type { Metadata, Viewport } from "next";
import { unstable_setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Locale, locales } from "../../../../../locales";

// Activation de la revalidation pour cette page
// export const dynamic = "force-static"; // Supprimé pour permettre une détection dynamique de l'authentification
export const revalidate = 300; // Revalider toutes les 5 minutes

// Spécifier que la page est dynamique pour s'assurer que l'authentification fonctionne
export const dynamic = "force-dynamic";

// Configuration du viewport séparée de metadata selon les recommandations Next.js
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Définir les paramètres statiques pour l'internationalisation
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// Fonction ReviewStar simplifiée
function ReviewStar({ filled }: { filled: boolean }) {
  return (
    <Star
      size={16}
      className={`${
        filled ? "fill-yellow-500 text-yellow-500" : "text-gray-300"
      }`}
    />
  );
}

// Fonction ReviewCard simplifiée
function ReviewCard({ review }: { review: any }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="size-8">
              <AvatarImage src={review.image || undefined} />
              <AvatarFallback>{review.name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{review.name}</p>
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <ReviewStar key={i} filled={i < review.rating} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm text-muted-foreground">{review.text}</p>
      </CardContent>
    </Card>
  );
}

interface PageProps {
  params: {
    locale: Locale;
    slug: string;
  };
}

export default async function RoutePage({ params }: PageProps) {
  // Activer la locale pour cette requête
  unstable_setRequestLocale(params.locale);

  const user = await currentUser();

  // Récupérer les informations du produit et des avis
  try {
    const product = await prisma.product.findUnique({
      where: {
        slug: params.slug,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        reviews: {
          where: {
            text: {
              not: null,
            },
          },
          select: {
            id: true,
            name: true,
            rating: true,
            text: true,
            userId: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!product) {
      return (
        <div className="h-full">
          <Header />
          <Layout>
            <div className="flex flex-col gap-6">
              {/* Fil d'Ariane simplifié pour page d'erreur */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link
                  href={`/${params.locale}`}
                  className="hover:text-foreground"
                >
                  <Home className="size-4" />
                </Link>
                <ChevronRight className="size-4" />
                <Link
                  href={`/${params.locale}/products`}
                  className="hover:text-foreground"
                >
                  Annonces
                </Link>
                <ChevronRight className="size-4" />
                <span className="text-foreground">Produit non trouvé</span>
              </div>

              <Card>
                <CardContent className="flex min-h-[200px] flex-col items-center justify-center p-6">
                  <CardTitle className="mb-4">Annonce non trouvée</CardTitle>
                  <p className="text-muted-foreground">
                    Désolé, nous n'avons pas pu trouver l'annonce demandée.
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href={`/${params.locale}/products`}>
                      Voir toutes les annonces
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </Layout>
        </div>
      );
    }

    // Préparer les avis avec les données utilisateur
    const reviewsWithUserData = product.reviews.map((review) => ({
      ...review,
      image: null, // On n'a pas l'image de l'utilisateur qui a laissé l'avis
    }));

    // Calculer la note moyenne
    const averageRating =
      reviewsWithUserData.length > 0
        ? (
            reviewsWithUserData.reduce(
              (sum, review) => sum + review.rating,
              0
            ) / reviewsWithUserData.length
          ).toFixed(1)
        : "0.0";

    // Déterminer si l'utilisateur est admin
    const isAdmin = user?.isAdmin ?? false;

    return (
      <div className="h-full">
        <Header />
        <Layout>
          <div className="space-y-6">
            {/* Fil d'Ariane */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link
                href={`/${params.locale}`}
                className="hover:text-foreground"
              >
                <Home className="size-4" />
              </Link>
              <ChevronRight className="size-4" />
              <Link
                href={`/${params.locale}/products`}
                className="hover:text-foreground"
              >
                Annonces
              </Link>
              <ChevronRight className="size-4" />
              <Link
                href={`/${params.locale}/products/${product.id}`}
                className="hover:text-foreground"
              >
                {product.name}
              </Link>
              <ChevronRight className="size-4" />
              <span className="text-foreground">Avis</span>
            </div>

            <div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <LayoutTitle>Avis sur {product.name}</LayoutTitle>
                  <p className="flex items-center gap-1 text-lg">
                    <span className="font-semibold">{averageRating}</span>
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm text-muted-foreground">
                      ({reviewsWithUserData.length} avis)
                    </span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {user && (
                    <Link
                      href={`/${params.locale}/r/${encodeURIComponent(
                        product.slug
                      )}`}
                      className={buttonVariants({ size: "sm" })}
                    >
                      Écrire un avis
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {reviewsWithUserData.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    Aucun avis pour le moment.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {reviewsWithUserData.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}
          </div>
        </Layout>
      </div>
    );
  } catch (error) {
    console.error("Erreur lors du chargement des avis:", error);
    notFound();
  }
}

// Génération de métadonnées SEO pour la page de mur d'avis
export async function generateMetadata({
  params,
}: {
  params: { locale: Locale; slug: string };
}): Promise<Metadata> {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      select: { name: true },
    });

    if (!product) {
      return createSeoMetadata({
        title: "Avis non trouvés | co-sport.com",
        description: "Ces avis n'existent pas ou ont été supprimés.",
        path: `/${params.locale}/wall/${params.slug}`,
        noindex: true,
      });
    }

    return createSeoMetadata({
      title: `Avis sur ${product.name} | co-sport.com`,
      description: `Découvrez les avis sur ${product.name} sur co-sport.com. Consultez les expériences d'autres utilisateurs pour cette activité sportive.`,
      path: `/${params.locale}/wall/${params.slug}`,
    });
  } catch (error) {
    console.error("Erreur lors de la génération des métadonnées:", error);
    return createSeoMetadata({
      title: "Erreur | co-sport.com",
      description: "Une erreur s'est produite lors du chargement des avis.",
      noindex: true,
    });
  }
}
