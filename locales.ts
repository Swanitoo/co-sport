export const locales = ["fr", "en", "es"] as const;
export const defaultLocale = "fr" as const;

export type Locale = (typeof locales)[number];

// Infos sur les langues disponibles
export const localeLabels: Record<Locale, { name: string; flag: string }> = {
  fr: { name: "Français", flag: "🇫🇷" },
  en: { name: "English", flag: "🇬🇧" },
  es: { name: "Español", flag: "🇪🇸" },
};
