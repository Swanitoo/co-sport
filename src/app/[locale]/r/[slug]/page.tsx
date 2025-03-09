import { currentUser } from "@/auth/current-user";
import { Layout, LayoutTitle } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Header } from "@/features/layout/Header";
import { prisma } from "@/prisma";
import { ChevronRight, Home } from "lucide-react";
import type { Metadata, Viewport } from "next";
import { unstable_setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Locale } from "../../../../../locales";
import RedirectButton from "./RedirectButton";

// Configuration pour forcer le rendu dynamique et désactiver la génération statique
export const dynamic = "force-dynamic";
export const generateStaticParams = undefined;

// Configuration du viewport séparée de metadata selon les recommandations Next.js
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

interface PageProps {
  params: {
    locale: Locale;
    slug: string;
  };
}

export default async function ReviewPage({ params }: PageProps) {
  // Activer la locale pour cette requête
  unstable_setRequestLocale(params.locale);

  const user = await currentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  try {
    const decodedSlug = decodeURIComponent(params.slug);

    const product = await prisma.product.findFirst({
      where: {
        slug: decodedSlug,
      },
      include: {
        memberships: {
          where: {
            userId: user.id,
            status: "APPROVED",
          },
        },
        reviews: {
          where: {
            userId: user.id,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                socialLink: true,
              },
            },
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
                  <CardTitle className="mb-4">Produit non trouvé</CardTitle>
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

    if (product.memberships.length === 0) {
      return (
        <div className="h-full">
          <Header />
          <Layout>
            <div className="flex flex-col gap-6">
              {/* Fil d'Ariane avec produit */}
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
                <span className="text-foreground">Laisser un avis</span>
              </div>

              <Card>
                <CardContent className="flex min-h-[200px] flex-col items-center justify-center p-6">
                  <CardTitle className="mb-4">Accès refusé</CardTitle>
                  <p className="text-muted-foreground">
                    Vous devez être un membre approuvé pour laisser un avis.
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href={`/${params.locale}/products/${product.id}`}>
                      Voir l'annonce
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </Layout>
        </div>
      );
    }

    // Dans la version complète, nous devons rediriger vers l'implémentation originale
    // qui utilise des composants clients
    return (
      <div className="h-full">
        <Header />
        <Layout>
          <div className="flex flex-col gap-6">
            {/* Fil d'Ariane avec produit */}
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
              <span className="text-foreground">Laisser un avis</span>
            </div>

            <LayoutTitle>Laisser un avis sur {product.name}</LayoutTitle>

            <Card>
              <CardContent className="flex flex-col gap-4">
                {/* Composant de notation et formulaire d'avis à implémenter */}
                <div className="flex justify-center">
                  <RedirectButton slug={product.slug} />
                </div>
              </CardContent>
            </Card>
          </div>
        </Layout>
      </div>
    );
  } catch (error) {
    console.error("Erreur lors du chargement de la page d'avis:", error);
    notFound();
  }
}

// Génération de métadonnées SEO pour la page d'avis
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
      return {
        title: "Avis - Produit non trouvé | co-sport.com",
        description: "Le produit demandé n'existe pas ou a été supprimé.",
      };
    }

    return {
      title: `Laisser un avis sur ${product.name} | co-sport.com`,
      description: `Partagez votre expérience avec ${product.name} sur co-sport.com. Votre avis aidera d'autres utilisateurs à découvrir cette activité sportive.`,
    };
  } catch (error) {
    console.error("Erreur lors de la génération des métadonnées:", error);
    return {
      title: "Laisser un avis | co-sport.com",
      description:
        "Partagez votre expérience sur une activité sportive sur co-sport.com.",
    };
  }
}
