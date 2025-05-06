import { getServerUrl } from "@/get-server-url";
import { Metadata } from "next";
import { locales } from "../../locales";

// Configuration de base pour le SEO
const baseConfig = {
  title: {
    default: "co-sport.com",
    template: "%s | co-sport.com",
  },
  description: "Trouve ton partenaire de sport et progressez ensemble !",
  metadataBase: new URL(getServerUrl()),
  alternates: {
    canonical: "/",
    languages: {
      "fr-FR": "/fr",
      "en-US": "/en",
      "es-ES": "/es",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    siteName: "co-sport.com",
    title: "co-sport.com",
    description: "Trouve ton partenaire de sport et progressez ensemble !",
    images: [
      {
        url: `${getServerUrl()}/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: "co-sport.com - Trouve ton partenaire de sport",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "co-sport.com",
    description: "Trouve ton partenaire de sport et progressez ensemble !",
    images: [`${getServerUrl()}/opengraph-image.png`],
    site: "@co_sport",
  },
};

// Mapping ISO pour les hreflang
const localeMapping: Record<string, string> = {
  fr: "fr-FR",
  en: "en-US",
  es: "es-ES",
};

// Fonction pour générer des métadonnées personnalisées par page
export function generateMetadata({
  title,
  description,
  path,
  ogImage,
  noindex,
}: {
  title?: string;
  description?: string;
  path?: string;
  ogImage?: string;
  noindex?: boolean;
}): Metadata {
  // Créer une URL canonique absolue
  const canonicalUrl = path
    ? new URL(path, getServerUrl()).toString()
    : getServerUrl();

  // Générer les URLs alternatives pour chaque langue
  const languageAlternates: Record<string, string> = {};
  if (path) {
    locales.forEach((locale) => {
      // Construction de l'URL alternative pour chaque langue
      const langPath = locale === "fr" ? path : `/${locale}${path}`;
      const fullUrl = new URL(langPath, getServerUrl()).toString();
      // Utiliser le mapping ISO pour les codes hreflang
      languageAlternates[localeMapping[locale]] = fullUrl;
    });
  }

  return {
    ...baseConfig,
    title: title ? title : baseConfig.title,
    description: description || baseConfig.description,
    // Utiliser l'URL canonique absolue
    alternates: {
      canonical: canonicalUrl,
      languages: path ? languageAlternates : baseConfig.alternates.languages,
    },
    // Configurer les robots si noindex est spécifié
    robots: noindex
      ? {
          index: false,
          follow: true,
          googleBot: {
            index: false,
            follow: true,
          },
        }
      : baseConfig.robots,
    // Mettre à jour les informations Open Graph si nécessaire
    openGraph: {
      ...baseConfig.openGraph,
      title: title || baseConfig.openGraph.title,
      description: description || baseConfig.openGraph.description,
      url: canonicalUrl,
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: title || "co-sport.com",
            },
          ]
        : baseConfig.openGraph.images,
    },
    // Mettre à jour les informations Twitter si nécessaire
    twitter: {
      ...baseConfig.twitter,
      title: title || baseConfig.twitter.title,
      description: description || baseConfig.twitter.description,
      images: ogImage ? [ogImage] : baseConfig.twitter.images,
    },
  };
}

// Configuration SEO par défaut pour l'application
export const defaultMetadata: Metadata = generateMetadata({});
