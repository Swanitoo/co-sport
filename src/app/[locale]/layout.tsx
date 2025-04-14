import { ThemeSync } from "@/components/theme-sync";
import { ThemeProvider } from "@/features/theme/ThemeProvider";
import { NextIntlClientProvider } from "next-intl";
import { unstable_setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ReactNode } from "react";
import { locales } from "../../../locales";

// Charger les messages selon la locale
async function getMessages(locale: string) {
  try {
    return (await import(`../../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout(props: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const { locale } = params;

  // Vérifiez si le locale est pris en charge
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Active la locale pour cette requête
  unstable_setRequestLocale(locale);

  const messages = await getMessages(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProvider>
        <ThemeSync />
        <div className="flex min-h-screen flex-col">
          {/* Le Header sera ajouté directement dans les pages qui en ont besoin */}
          <main className="flex-1">{props.children}</main>
        </div>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
