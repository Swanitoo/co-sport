import { getRequestConfig } from "next-intl/server";
import { locales } from "./locales";

export default getRequestConfig(async ({ requestLocale }) => {
  // Conversion appropriée du requestLocale pour éviter les problèmes de type
  let locale = await requestLocale;

  // S'assurer que la locale est valide
  if (!locale || !locales.includes(locale as any)) {
    locale = "fr"; // Utiliser la locale par défaut
  }

  try {
    return {
      locale, // Retourner explicitement la locale
      messages: (await import(`./messages/${locale}.json`)).default,
    };
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    return {
      locale: "fr", // Fallback à fr en cas d'erreur
      messages: {},
    };
  }
});
