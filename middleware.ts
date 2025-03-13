import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, locales } from "./locales";

// Middleware d'internationalisation
const intlMiddleware = createIntlMiddleware({
  // Langues disponibles
  locales: locales,
  // Langue par défaut
  defaultLocale: defaultLocale,
  // Mode de préfixe pour les URLs
  localePrefix: "as-needed",
});

// Middleware combiné
export default function middleware(request: NextRequest) {
  // Logging pour les routes d'authentification
  if (
    request.nextUrl.pathname.startsWith("/api/auth") ||
    request.nextUrl.pathname === "/login"
  ) {
    console.log("Middleware - URL:", request.nextUrl.toString());

    // Vérifier si c'est une redirection d'authentification
    if (request.nextUrl.pathname.startsWith("/api/auth")) {
      console.log("Middleware - Auth route detected");
      console.log(
        "Middleware - Query params:",
        Object.fromEntries(request.nextUrl.searchParams.entries())
      );
    }
  }

  // Appliquer le middleware d'internationalisation pour les routes concernées
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    return intlMiddleware(request);
  }

  return NextResponse.next();
}

// Configuration des routes qui déclenchent ce middleware
export const config = {
  // Matcher combiné pour les deux middlewares
  matcher: [
    // Routes d'authentification pour le logging
    "/api/auth/:path*",
    "/login",
    // Routes pour l'internationalisation (en excluant les ressources statiques)
    "/((?!api|_next/static|_next/image|favicon.ico|images|debug-page|test|.*\\.png$).*)",
  ],
};
