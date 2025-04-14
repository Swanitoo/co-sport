import { currentUser } from "@/auth/current-user";
import { BadgesExplanationSection } from "@/features/landing/BadgesExplanationSection";
import { CTASection } from "@/features/landing/CTASection";
import { FAQSection } from "@/features/landing/FAQSection";
import { FeatureBoxes } from "@/features/landing/FeatureBoxes";
import { FeatureSection } from "@/features/landing/FeatureSection";
import { FooterSection } from "@/features/landing/Footersection";
import { HeroSection } from "@/features/landing/HeroSection";
import { LandingHeader } from "@/features/landing/LandingHeader";
import { SupportSection } from "@/features/landing/SupportSection";
import { prisma } from "@/prisma";
import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { Suspense } from "react";
import { LatestProducts } from "./LatestProducts";

// Configuration optimisée pour Next.js 15
export const runtime = "edge";
export const preferredRegion = "auto";
export const dynamic = "force-static"; // Utilise le rendu statique pour les parties non dynamiques
export const revalidate = 300; // Revalider toutes les 5 minutes

// Pour les parties dynamiques qui ne doivent pas être mises en cache
export const unstable_partialPrerendering = true; // Activer PPR (Next.js 15)

// Squelette pour le chargement des derniers produits - optimisé pour réduire le CLS
function LatestProductsSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <div className="mb-8 animate-pulse space-y-3">
        <div className="h-8 w-48 rounded bg-muted"></div>
        <div className="h-4 w-64 rounded bg-muted"></div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="animate-pulse space-y-3 rounded-xl border p-6"
              style={{ height: "280px" }} // Hauteur fixe pour réduire le CLS
            >
              <div className="h-4 w-2/3 rounded bg-muted"></div>
              <div className="h-20 w-full rounded bg-muted"></div>
              <div className="h-4 w-full rounded bg-muted"></div>
              <div className="h-4 w-1/2 rounded bg-muted"></div>
            </div>
          ))}
      </div>
    </div>
  );
}

// Charge les produits de manière asynchrone avec mise en cache optimisée pour Next.js 15
async function getLatestProducts() {
  // En utilisant noStore() pour les parties dynamiques dans PPR
  noStore();

  return prisma.product.findMany({
    where: {
      enabled: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 9, // Limiter pour améliorer les performances
    select: {
      id: true,
      slug: true,
      name: true,
      sport: true,
      level: true,
      description: true,
      venueName: true,
      venueAddress: true,
      user: {
        select: {
          name: true,
          country: true,
          image: true,
        },
      },
      _count: {
        select: {
          reviews: true,
        },
      },
    },
  });
}

// Charger les messages avec mise en cache
async function getMessages() {
  // Utiliser la nouvelle syntaxe de Next.js 15 pour l'importation avec type
  return (
    await import("../../../../messages/fr.json", { with: { type: "json" } })
  ).default;
}

// Génération des métadonnées SEO pour la page d'accueil
export function generateMetadata(): Metadata {
  return {
    title:
      "co-sport.com - Trouve ton partenaire de sport et progressez ensemble !",
    description:
      "co-sport.com est la plateforme idéale pour trouver des partenaires de sport près de chez toi. Pratique des sports ensemble, rejoins des groupes et améliore ta performance !",
    keywords:
      "sport entre femmes, partenaires sportifs, communauté sportive, sport en toute sécurité, trouver un partenaire de sport",
    openGraph: {
      title:
        "co-sport.com - Trouve ton partenaire de sport et progressez ensemble !",
      description:
        "co-sport.com est la plateforme idéale pour trouver des partenaires de sport près de chez toi. Pratique des sports ensemble, rejoins des groupes et améliore ta performance !",
      images: ["/opengraph-image.png"],
    },
    alternates: {
      canonical: "https://co-sport.com",
      languages: {
        fr: "https://co-sport.com/fr",
        en: "https://co-sport.com/en",
        es: "https://co-sport.com/es",
      },
    },
  };
}

// Composant pour les boxes fonctionnalités avec authentification
async function FeatureBoxesSection() {
  const user = await currentUser();
  return <FeatureBoxes isAuthenticated={!!user} />;
}

// Utilisation de boundary pour isoler les requêtes DB
async function LatestProductsWrapper() {
  const products = await getLatestProducts();
  const user = await currentUser();
  return <LatestProducts products={products} isAuthenticated={!!user} />;
}

export default async function Home() {
  const messages = await getMessages();

  // Définir les traductions en français directement pour la page d'accueil par défaut
  const heroTranslations = {
    soon: messages.Home.soon,
    app_mobile: messages.Home.app_mobile,
    hero_title: messages.Home.hero_title,
    hero_subtitle: messages.Home.hero_subtitle,
    cta_button: messages.Home.cta_button,
  };

  // Traductions pour le CTA
  const ctaTranslations = {
    cta_button: "Commencer",
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="h-16" />
      <LandingHeader />
      <HeroSection translations={heroTranslations} />

      {/* Utiliser Suspense avec des clés pour Next.js 15 afin d'améliorer le streaming */}
      <Suspense
        key="feature-boxes"
        fallback={
          <div
            className="mx-auto max-w-7xl animate-pulse rounded-lg bg-muted/30 px-6 py-12"
            style={{ height: "300px" }}
          />
        }
      >
        <FeatureBoxesSection />
      </Suspense>

      <Suspense key="latest-products" fallback={<LatestProductsSkeleton />}>
        <LatestProductsWrapper />
      </Suspense>

      <Suspense
        key="badges"
        fallback={<div className="h-[200px] animate-pulse bg-muted/20" />}
      >
        <BadgesExplanationSection />
      </Suspense>

      <Suspense
        key="features"
        fallback={<div className="h-[300px] animate-pulse bg-muted/20" />}
      >
        <FeatureSection />
      </Suspense>

      <Suspense
        key="support"
        fallback={<div className="h-[200px] animate-pulse bg-muted/20" />}
      >
        <SupportSection />
      </Suspense>

      <Suspense
        key="faq"
        fallback={<div className="h-[300px] animate-pulse bg-muted/20" />}
      >
        <FAQSection />
      </Suspense>

      <Suspense
        key="cta"
        fallback={<div className="h-[150px] animate-pulse bg-muted/20" />}
      >
        <CTASection translations={ctaTranslations} />
      </Suspense>

      <Suspense
        key="footer"
        fallback={<div className="h-[200px] animate-pulse bg-muted/20" />}
      >
        <FooterSection />
      </Suspense>
    </div>
  );
}
