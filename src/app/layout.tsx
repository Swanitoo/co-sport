import { currentUser } from "@/auth/current-user";
import { ThemeScript } from "@/components/theme-script";
import { getServerUrl } from "@/get-server-url";
import { cn } from "@/lib/utils";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

// Optimisation: précharger la police Inter pour une meilleure performance
const inter = Inter({
  subsets: ["latin"],
  display: "swap", // Utiliser 'swap' pour éviter un texte invisible pendant le chargement
  preload: true,
  // Optimisation: réduire le nombre de variantes chargées si possible
  weight: ["400", "500", "600", "700"],
});

// Configuration du viewport séparée selon les recommandations Next.js
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f1f5f9" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export const metadata: Metadata = {
  title:
    "Co-Sport | Trouve ton partenaire sportif idéal | Entraînements, Matches & Progression",
  description:
    "Rejoins Co-Sport pour trouver facilement ton partenaire sportif près de chez toi. Running, musculation, alpinisme, boxe, escalade, randonnée... Progresse plus vite et rends tes sessions plus motivantes avec des sportifs de ton niveau !",
  metadataBase: new URL(getServerUrl()),
  applicationName: "co-sport.com",
  authors: [{ name: "co-sport.com", url: "https://co-sport.com" }],
  creator: "co-sport.com",
  publisher: "co-sport.com",
  keywords: [
    "sport",
    "partenaire",
    "rencontre sportive",
    "alpinisme",
    "boxe",
    "tennis",
    "football",
    "musculation",
    "running",
    "natation",
    "match",
    "entrainement",
    "sportif",
    "coach",
    "fitness",
    "yoga",
    "escalade",
    "randonnée",
    "ski",
    "partenaire sportif",
    "trouver sportif",
    "France",
    "sport ensemble",
    "progresser sport",
    "motivation sportive",
  ],
  category: "sports",
  manifest: "/manifest.json",
  verification: {
    google: "wEjtYUJjXsMQInNKer1vqCSrvuA2FRYrbApEyLYNLfQ",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Co-Sport | Trouve ton partenaire sportif idéal",
  },
  formatDetection: {
    telephone: true,
    date: true,
    address: true,
    email: true,
    url: true,
  },
  // Optimisation SEO: ajouter les balises OpenGraph pour améliorer le partage
  openGraph: {
    type: "website",
    url: getServerUrl(),
    title: "Co-Sport | Trouve ton partenaire sportif idéal",
    description:
      "Rejoins Co-Sport pour trouver facilement ton partenaire sportif près de chez toi. Running, musculation, alpinisme, boxe, escalade, randonnée... Progresse plus vite et rends tes sessions plus motivantes avec des sportifs de ton niveau !",
    siteName: "Co-Sport",
    locale: "fr_FR",
    images: [
      {
        url: `${getServerUrl()}/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: "Co-Sport - Plateforme de rencontre sportive",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Co-Sport | Trouve ton partenaire sportif idéal",
    description:
      "Rejoins Co-Sport pour trouver facilement ton partenaire sportif près de chez toi. Running, musculation, alpinisme, boxe, escalade, randonnée... Progresse plus vite et rends tes sessions plus motivantes avec des sportifs de ton niveau !",
    images: [`${getServerUrl()}/opengraph-image.png`],
    creator: "@cosport",
  },
  alternates: {
    canonical: getServerUrl(),
    languages: {
      fr: `${getServerUrl()}/fr`,
    },
  },
};

export default async function RootLayout(
  props: Readonly<{
    children: React.ReactNode;
    params?: { locale?: string };
  }>
) {
  const params = await props.params;

  const { children } = props;

  const user = await currentUser();
  // Utiliser 'fr' par défaut si la locale n'est pas disponible
  const locale = params?.locale || "fr";

  return (
    <html lang={locale} className="h-full" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta
          name="google-site-verification"
          content="wEjtYUJjXsMQInNKer1vqCSrvuA2FRYrbApEyLYNLfQ"
        />
        {/* Favicon optimisé pour Google Search */}
        <link rel="icon" type="image/png" href="/icon.png" sizes="96x96" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon.png" />
        {/* Optimisation: précharger les ressources critiques */}
        {/* La police Inter est déjà gérée par next/font/google, pas besoin de la précharger manuellement */}
      </head>
      <body className={cn(inter.className, "h-full")}>
        {/* ParallaxIcons est inclus dans chaque layout spécifique où il est nécessaire */}
        <Providers userId={user?.id}>{children}</Providers>
      </body>
    </html>
  );
}
