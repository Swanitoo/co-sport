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
  title: "co-sport.com",
  description: "Trouve ton partenaire de sport et progressez ensemble !",
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
  ],
  category: "sports",
  manifest: "/manifest.json",
  verification: {
    google: "wEjtYUJjXsMQInNKer1vqCSrvuA2FRYrbApEyLYNLfQ",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "co-sport.com",
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
    title: "co-sport.com",
    description: "Trouve ton partenaire de sport et progressez ensemble !",
    siteName: "co-sport.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "co-sport.com",
    description: "Trouve ton partenaire de sport et progressez ensemble !",
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
      </head>
      <body className={cn(inter.className, "h-full")}>
        {/* ParallaxIcons est inclus dans chaque layout spécifique où il est nécessaire */}
        <Providers userId={user?.id}>{children}</Providers>
      </body>
    </html>
  );
}
