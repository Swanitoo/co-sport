import { NextRequest, NextResponse } from "next/server";

/**
 * Wrapper pour gérer les erreurs dans les routes API
 * @param handler - Fonction de handler de route API
 * @returns Fonction de handler avec gestion d'erreurs
 */
export function withErrorHandler(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      // Exécuter le handler original
      return await handler(req);
    } catch (error) {
      console.error(`Erreur API non gérée: ${(error as Error).message}`, error);

      // Erreur Prisma ou autre erreur de base de données
      if ((error as any).code && (error as any).code.startsWith("P")) {
        return NextResponse.json(
          {
            error: "Erreur de base de données",
            message: "Une erreur est survenue lors de l'accès aux données",
          },
          { status: 503 } // Service Unavailable
        );
      }

      // Erreur d'authentification
      if (
        (error as Error).message.includes("unauthorized") ||
        (error as Error).message.includes("authentication")
      ) {
        return NextResponse.json(
          {
            error: "Non autorisé",
            message: "Vous n'êtes pas autorisé à accéder à cette ressource",
          },
          { status: 401 } // Unauthorized
        );
      }

      // Erreur de validation
      if ((error as Error).message.includes("validation")) {
        return NextResponse.json(
          {
            error: "Validation échouée",
            message: "Les données fournies ne sont pas valides",
          },
          { status: 400 } // Bad Request
        );
      }

      // Erreur générique - remplacer par 500 en production
      return NextResponse.json(
        {
          error: "Erreur serveur",
          message:
            process.env.NODE_ENV === "production"
              ? "Une erreur interne est survenue"
              : (error as Error).message,
        },
        { status: 500 } // Internal Server Error
      );
    }
  };
}
