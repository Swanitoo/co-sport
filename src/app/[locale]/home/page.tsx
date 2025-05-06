import {
  SupportedLocale,
  translateLevel,
  translateSport,
} from "@/app/(customer)/annonces/[slug]/edit/product.schema";
import { LatestProducts } from "@/app/(landing)/home/LatestProducts";
import { currentUser } from "@/auth/current-user";
import { ParallaxIcons } from "@/components/parallax/ParallaxIcons";
import { CTASection } from "@/features/landing/CTASection";
import { FAQSection } from "@/features/landing/FAQSection";
import { FeatureSection } from "@/features/landing/FeatureSection";
import { FooterSection } from "@/features/landing/Footersection";
import { HeroSection } from "@/features/landing/HeroSection";
import { LandingHeader } from "@/features/landing/LandingHeader";
import { LocalizedBadgesExplanationSection } from "@/features/landing/LocalizedBadgesExplanationSection";
import { LocalizedFeatureBoxes } from "@/features/landing/LocalizedFeatureBoxes";
import { LocalizedSupportSection } from "@/features/landing/LocalizedSupportSection";
import { prisma } from "@/prisma";
import { unstable_setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "../../../../locales";

// Définir le type Locale localement si l'import ne fonctionne pas
type Locale = (typeof locales)[number];

// Charger les messages selon la locale (comme dans layout.tsx)
async function getMessages(locale: Locale) {
  try {
    return (await import(`../../../../messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    notFound();
  }
}

type Props = {
  params: Promise<{ locale: Locale }>;
};

export default async function LocalizedHomePage(props: Props) {
  const params = await props.params;

  const { locale } = params;

  // Active la locale pour cette requête
  unstable_setRequestLocale(locale);

  // Vérifier si la locale est prise en charge
  if (!locales.includes(locale as any)) {
    notFound();
  }

  const user = await currentUser();

  // Récupérer les messages pour le client
  const messages = await getMessages(locale);

  // Extraire les traductions nécessaires pour HeroSection
  const heroTranslations = {
    soon: messages.Home.soon,
    app_mobile: messages.Home.app_mobile,
    hero_title: messages.Home.hero_title,
    hero_subtitle: messages.Home.hero_subtitle,
    cta_secondary: messages.Home.cta_secondary,
    cta_button: messages.Home.cta_button,
  };

  // Extraire les traductions pour CTASection
  const ctaTranslations = {
    cta_button: messages.Home.cta_button,
  };

  // Extraire les traductions pour LatestProducts
  const latestProductsTranslations = {
    title: messages.Home.latest_products,
    subtitle: messages.Home.latest_products_subtitle,
  };

  // Récupérer les derniers produits
  let latestProducts = await prisma.product.findMany({
    where: {
      enabled: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 9,
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

  // Si nous ne sommes pas en français, traduire les sports et niveaux
  // en utilisant les nouvelles fonctions utilitaires du schéma de produit
  if (locale !== "fr") {
    latestProducts = latestProducts.map((product) => {
      return {
        ...product,
        originalSportName: product.sport,
        originalLevelName: product.level,
        sport: translateSport(product.sport, locale as SupportedLocale),
        level: translateLevel(product.level, locale as SupportedLocale),
      };
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <ParallaxIcons />
      <div className="h-16" />
      <LandingHeader />
      <HeroSection translations={heroTranslations} />
      <LocalizedFeatureBoxes isAuthenticated={!!user} />
      <LatestProducts
        products={latestProducts}
        isAuthenticated={!!user}
        translations={latestProductsTranslations}
      />
      <LocalizedBadgesExplanationSection />
      <FeatureSection />
      <LocalizedSupportSection />
      <FAQSection />
      <CTASection translations={ctaTranslations} />
      <FooterSection />
    </div>
  );
}
