import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

/**
 * Récupérer les statistiques sportives d'un utilisateur
 * Cette route est publique et peut être utilisée pour afficher les statistiques
 * sur les pages de profil ou dans les filtres
 */
export async function GET(_req: NextRequest, props: { params: Promise<{ userId: string }> }) {
  const params = await props.params;
  try {
    const targetUserId = params.userId;

    // Vérifier que l'ID est valide
    if (!targetUserId) {
      return NextResponse.json(
        { error: "ID utilisateur requis" },
        { status: 400 }
      );
    }

    // Récupérer les statistiques de l'utilisateur
    const user = await db.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        stravaRunningPace: true,
        stravaCyclingSpeed: true,
        stravaAvgDistance: true,
        stravaItraPoints: true,
        stravaStatsUpdatedAt: true,
        stravaId: true,
        stravaConnected: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Si l'utilisateur n'est pas connecté à Strava, retourner des données vides
    if (!user.stravaConnected) {
      return NextResponse.json({
        id: user.id,
        stravaConnected: false,
        message: "Utilisateur non connecté à Strava",
      });
    }

    // Formater la réponse
    const stats = {
      id: user.id,
      stravaConnected: true,
      running: {
        pace: user.stravaRunningPace,
      },
      cycling: {
        speed: user.stravaCyclingSpeed,
      },
      avgDistance: user.stravaAvgDistance,
      itraPoints: user.stravaItraPoints,
      lastUpdated: user.stravaStatsUpdatedAt,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des statistiques Strava:",
      error
    );
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
