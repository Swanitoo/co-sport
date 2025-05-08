import { getServerUrl } from "@/get-server-url";
import { Metadata } from "next";

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
        url: "/opengraph-image.png",
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
    images: ["/opengraph-image.png"],
    site: "@co_sport",
  },
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
  return {
    ...baseConfig,
    title: title ? title : baseConfig.title,
    description: description || baseConfig.description,
    // Mettre à jour l'URL canonique en fonction du chemin
    alternates: {
      canonical: path ? path : "/",
    },
    // Configurer les robots si noindex est spécifié
    robots: noindex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : baseConfig.robots,
    // Mettre à jour les informations Open Graph si nécessaire
    openGraph: {
      ...baseConfig.openGraph,
      title: title || baseConfig.openGraph.title,
      description: description || baseConfig.openGraph.description,
      url: path ? path : "/",
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
