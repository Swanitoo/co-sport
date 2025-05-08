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
    const response = intlMiddleware(request);

    // Ajouter les en-têtes de sécurité à la réponse
    if (response) {
      // Content-Security-Policy pour protéger contre les attaques XSS
      response.headers.set(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://vercel.live; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*;"
      );

      // X-Frame-Options pour éviter le clickjacking
      response.headers.set("X-Frame-Options", "SAMEORIGIN");

      // X-Content-Type-Options pour éviter le MIME-sniffing
      response.headers.set("X-Content-Type-Options", "nosniff");

      // Referrer-Policy pour contrôler les informations envoyées lors de la navigation
      response.headers.set(
        "Referrer-Policy",
        "strict-origin-when-cross-origin"
      );

      // Permissions-Policy pour contrôler les fonctionnalités du navigateur
      response.headers.set(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=(), interest-cohort=()"
      );
    }

    return response;
  }

  // Pour les routes API, ajouter également les en-têtes de sécurité
  const response = NextResponse.next();

  // Ajouter les en-têtes de sécurité aux routes API
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://vercel.live; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*;"
  );
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  // Normalisation WWW
  // Rediriger de co-sport.com vers www.co-sport.com
  const host = request.headers.get("host");
  if (
    host &&
    !host.startsWith("www.") &&
    !host.includes("localhost") &&
    !host.includes("127.0.0.1")
  ) {
    const newUrl = new URL(request.url);
    newUrl.host = "www." + host;
    return NextResponse.redirect(newUrl, {
      status: 308, // Permanent redirect
    });
  }

  return response;
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
