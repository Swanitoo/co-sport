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
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await currentUser();

  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={cn(inter.className, "h-full")}>
        <ParallaxIcons />
        <Providers userId={user?.id}>{children}</Providers>
      </body>
    </html>
  );
}
