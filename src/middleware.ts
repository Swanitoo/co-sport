import { NextRequest, NextResponse } from "next/server";
import { withMiddlewareErrorHandler } from "./lib/middleware-utils";

// Liste des routes d'API
const API_ROUTES = ["/api/"];

/**
 * Middleware principal de l'application
 */
const middleware = async (req: NextRequest) => {
  const { pathname } = req.nextUrl;

  // Ajouter des entêtes de sécurité pour toutes les requêtes
  const response = NextResponse.next();

  // Ajout d'en-têtes de sécurité pour toutes les réponses
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Permettre les frames depuis vercel.live en plus de l'origine
  response.headers.set("X-Frame-Options", "SAMEORIGIN");

  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Pour les routes d'API, ajout de l'entête Cache-Control pour éviter la mise en cache
  if (API_ROUTES.some((route) => pathname.startsWith(route))) {
    response.headers.set("Cache-Control", "no-store, max-age=0");
  }

  return response;
};

// Configuration des chemins pour lesquels le middleware sera exécuté
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|webp)|robots.txt).*)",
  ],
};

// Exporter le middleware avec le gestionnaire d'erreurs
export default withMiddlewareErrorHandler(middleware);
