import { currentUser } from "@/auth/current-user";
import { CTASection } from "@/features/landing/CTASection";
import { FAQSection } from "@/features/landing/FAQSection";
import { FeatureSection } from "@/features/landing/FeatureSection";
import { FooterSection } from "@/features/landing/Footersection";
import { HeroSection } from "@/features/landing/HeroSection";
import { LandingHeader } from "@/features/landing/LandingHeader";
import { prisma } from "@/prisma";
import { LatestProducts } from "./LatestProducts";

export default async function Home() {
  const user = await currentUser();

  // Définir les traductions en français directement pour la page d'accueil par défaut
  const heroTranslations = {
    soon: "Prochainement",
    app_mobile: "L'application mobile",
    hero_title: "Trouve ton partenaire de sport",
    hero_subtitle:
      "Choisis ton sport, trouve ton partenaire idéal et progressez ensemble.",
    cta_secondary: "Voir la vidéo",
  };

  // Traductions pour le CTA
  const ctaTranslations = {
    cta_button: "Commencer",
  };

  const latestProducts = await prisma.product.findMany({
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

  return (
    <div className="flex flex-col gap-4">
      <div className="h-16" />
      <LandingHeader />
      <HeroSection translations={heroTranslations} />
      <LatestProducts products={latestProducts} isAuthenticated={!!user} />
      <FeatureSection />
      <FAQSection />
      <CTASection translations={ctaTranslations} />
      <FooterSection />
    </div>
  );
}
