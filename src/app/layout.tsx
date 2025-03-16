import { currentUser } from "@/auth/current-user";
import { ParallaxIcons } from "@/components/parallax/ParallaxIcons";
import { ThemeScript } from "@/components/theme-script";
import { getServerUrl } from "@/get-server-url";
import { cn } from "@/lib/utils";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

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
  description: "Trouve ton partenaire de sport et progressez enssemble !",
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
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params?: { locale?: string };
}>) {
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
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9578850534114306"
          crossOrigin="anonymous"
        />
      </head>
      <body className={cn(inter.className, "h-full")}>
        <ParallaxIcons />
        <Providers userId={user?.id}>{children}</Providers>
      </body>
    </html>
  );
}
