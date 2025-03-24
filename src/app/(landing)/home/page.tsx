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
import { Suspense } from "react";
import { LatestProducts } from "./LatestProducts";

// Configuration ISR
export const dynamic = "force-static"; // Utiliser le rendu statique pour la page d'accueil
export const revalidate = 300; // Revalider toutes les 5 minutes (300 secondes)

// Squelette pour le chargement des derniers produits
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

// Charge les produits de manière asynchrone
async function getLatestProducts() {
  return prisma.product.findMany({
    where: {
      enabled: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 9,
    select: {
      id: true,
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

// Charger les messages
async function getMessages() {
  return (await import("../../../../messages/fr.json")).default;
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
  };
}

// Composant pour les boxes fonctionnalités avec authentification
async function FeatureBoxesSection() {
  const user = await currentUser();
  return <FeatureBoxes isAuthenticated={!!user} />;
}

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
      <Suspense>
        <FeatureBoxesSection />
      </Suspense>
      <Suspense fallback={<LatestProductsSkeleton />}>
        <LatestProductsWrapper />
      </Suspense>
      <Suspense>
        <BadgesExplanationSection />
      </Suspense>
      <Suspense>
        <FeatureSection />
      </Suspense>
      <Suspense>
        <SupportSection />
      </Suspense>
      <Suspense>
        <FAQSection />
      </Suspense>
      <Suspense>
        <CTASection translations={ctaTranslations} />
      </Suspense>
      <Suspense>
        <FooterSection />
      </Suspense>
    </div>
  );
}
