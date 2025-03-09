import createMiddleware from "next-intl/middleware";
import { defaultLocale, locales } from "./locales";

// Middleware pour gérer l'internationalisation
export default createMiddleware({
  // Langues disponibles
  locales: locales,
  // Langue par défaut
  defaultLocale: defaultLocale,
  // Mode de préfixe pour les URLs
  localePrefix: "as-needed",
});

export const config = {
  // Matcher pour les routes qui doivent passer par le middleware
  matcher: [
    // Exclure les fichiers statiques, API routes, etc.
    "/((?!api|_next/static|_next/image|favicon.ico|images|debug-page|test|.*\\.png$).*)",
  ],
};
