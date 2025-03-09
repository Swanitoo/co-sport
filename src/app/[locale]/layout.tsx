import { THEME_CONFIG } from "@/app/providers";
import { ThemeScript } from "@/components/theme-script";
import { ThemeSync } from "@/components/theme-sync";
import { ThemeProvider } from "@/features/theme/ThemeProvider";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { ReactNode } from "react";
import { Locale, locales } from "../../../locales";

// Charger les messages selon la locale
async function getMessages(locale: Locale) {
  try {
    return (await import(`../../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: ReactNode;
  params: { locale: Locale };
}) {
  // Vérifier si la locale est prise en charge
  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages(locale);

  // Nous ne pouvons pas utiliser usePathname directement dans un composant serveur
  // mais nous pouvons vérifier si c'est la page d'accueil d'une autre manière
  // en examinant les composants enfants rendus

  return (
    <html lang={locale}>
      <head>
        <ThemeScript />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider {...THEME_CONFIG}>
            <ThemeSync />
            {/* Pour la page principale, nous n'affichons pas le Header ici,
                car il sera affiché par le composant LandingHeader */}
            <div className="flex min-h-screen flex-col">
              {/* Le Header sera ajouté directement dans les pages qui en ont besoin */}
              <main className="flex-1">{children}</main>
            </div>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
