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

export default async function LocaleLayout(
  props: {
    children: ReactNode;
    params: Promise<{ locale: Locale }>;
  }
) {
  const params = await props.params;

  const {
    locale
  } = params;

  const {
    children
  } = props;

  // Vérifier si la locale est prise en charge
  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProvider>
        <ThemeSync />
        <div className="flex min-h-screen flex-col">
          {/* Le Header sera ajouté directement dans les pages qui en ont besoin */}
          <main className="flex-1">{children}</main>
        </div>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
