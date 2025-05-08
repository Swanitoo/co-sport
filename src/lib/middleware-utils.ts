import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type MiddlewareHandler = (
  request: NextRequest
) => Promise<NextResponse | Response> | NextResponse | Response;

/**
 * Wrapper pour gérer les erreurs dans les middlewares
 * @param handler - Fonction de handler du middleware
 * @returns Fonction de handler avec gestion d'erreurs
 */
export function withMiddlewareErrorHandler(handler: MiddlewareHandler) {
  return async (request: NextRequest) => {
    try {
      // Exécuter le handler original
      return await handler(request);
    } catch (error) {
      console.error(
        `Erreur middleware non gérée: ${(error as Error).message}`,
        error
      );

      // Créer une réponse d'erreur
      return new NextResponse(
        JSON.stringify({
          error: "Erreur serveur",
          message:
            process.env.NODE_ENV === "production"
              ? "Une erreur interne est survenue"
              : (error as Error).message,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  };
}

/**
 * Vérifier si une URL correspond à un motif
 * @param url - URL complète
 * @param pattern - Motif à vérifier
 * @returns True si l'URL correspond au motif
 */
export function matchesPattern(url: string, pattern: string): boolean {
  // Convertir le motif en expression régulière
  const regexPattern = pattern
    .replace(/\//g, "\\/") // Échapper les slashes
    .replace(/\*/g, ".*"); // Convertir * en .*

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(url);
}

/**
 * Vérifier si un chemin commence par un des préfixes spécifiés
 * @param path - Chemin d'URL
 * @param prefixes - Préfixes à vérifier
 * @returns True si le chemin commence par un des préfixes
 */
export function startsWithAny(path: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => path.startsWith(prefix));
}
