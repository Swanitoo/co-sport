import { currentUser } from "@/auth/current-user";
import { ThemeScript } from "@/components/theme-script";
import { cn } from "@/lib/utils";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

// Définition de la police optimisée pour les performances
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  preload: true, // Préchargement pour améliorer LCP
});

// Configuration de viewport pour Next.js 15
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f1f5f9" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    template: "%s | co-sport.com",
    default:
      "co-sport.com - Trouvez votre partenaire de sport et progressez ensemble !",
  },
  description:
    "co-sport.com est la plateforme idéale pour trouver des partenaires de sport. Trouvez des sportifs de votre niveau, rejoignez des groupes et améliorez votre performance !",
  keywords: ["sport", "partenaires", "communauté sportive", "match sportif"],
  authors: [
    {
      name: "co-sport.com",
      url: "https://co-sport.com",
    },
  ],
  creator: "Equipe co-sport",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://co-sport.com",
    title: "co-sport.com - Trouvez votre partenaire de sport",
    description: "Trouvez des partenaires de sport qui vous correspondent",
    siteName: "co-sport.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "co-sport.com - Trouvez votre partenaire de sport",
    description: "Trouvez des partenaires de sport qui vous correspondent",
    creator: "@cosportcom",
  },
  metadataBase: new URL("https://co-sport.com"),
  alternates: {
    canonical: "/",
    languages: {
      fr: "/fr",
      en: "/en",
      es: "/es",
    },
  },
  // Optimisations modernes pour SEO et partage
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
  },
  // Optimiser les requêtes DNS pour les connexions externes
  other: {
    "dns-prefetch": [
      "https://fonts.googleapis.com",
      "https://fonts.gstatic.com",
      "https://maps.googleapis.com",
    ],
  },
};

// Configuration pour optimiser le cache des pages statiques
export const dynamic = "force-static";
export const revalidate = 600; // 10 minutes

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
}) {
  const resolvedParams = await params;
  const user = await currentUser();
  // Utiliser 'fr' par défaut si la locale n'est pas disponible
  const locale = resolvedParams?.locale || "fr";

  return (
    <html lang={locale} className="h-full" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta
          name="google-site-verification"
          content="wEjtYUJjXsMQInNKer1vqCSrvuA2FRYrbApEyLYNLfQ"
        />
        {/* Optimisation: précharger les ressources critiques */}
        <link
          rel="preload"
          href="/fonts/inter.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* Google AdSense - chargé de manière asynchrone pour ne pas bloquer le rendu */}
        <script
          async
          defer
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9578850534114306"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Préchargement de polices et ressources critiques */}
        <link rel="preload" href="/logo.svg" as="image" type="image/svg+xml" />
      </head>
      <body className={cn(inter.variable, "h-full")}>
        {/* ParallaxIcons est inclus dans chaque layout spécifique où il est nécessaire */}
        <Providers userId={user?.id}>{children}</Providers>
      </body>
    </html>
  );
}
