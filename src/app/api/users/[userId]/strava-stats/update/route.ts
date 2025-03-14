import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

/**
 * Mettre à jour les statistiques sportives d'un utilisateur
 * Cette route est protégée et ne peut être utilisée que par l'utilisateur lui-même ou un administrateur
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth();
    const targetUserId = params.userId;

    // Vérifier l'authentification
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier les autorisations (seul l'utilisateur lui-même ou un admin peut mettre à jour)
    // @ts-ignore - La propriété isAdmin existe bien dans notre session personnalisée
    if (session.user.id !== targetUserId && !session.user.isAdmin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const data = await req.json();

    // Valider les données
    const validKeys = [
      "stravaRunningPace",
      "stravaCyclingSpeed",
      "stravaAvgDistance",
      "stravaItraPoints",
      "stravaStatsUpdatedAt",
    ];

    // Filtrer les données pour ne garder que les clés valides
    const filteredData = Object.keys(data)
      .filter((key) => validKeys.includes(key))
      .reduce((obj, key) => {
        obj[key] = data[key];
        return obj;
      }, {} as Record<string, any>);

    // Ajouter la date de mise à jour
    filteredData.stravaStatsUpdatedAt = new Date();

    // Mettre à jour l'utilisateur
    const updatedUser = await db.user.update({
      where: { id: targetUserId },
      data: filteredData,
      select: {
        id: true,
        stravaRunningPace: true,
        stravaCyclingSpeed: true,
        stravaAvgDistance: true,
        stravaItraPoints: true,
        stravaStatsUpdatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour des statistiques Strava:",
      error
    );
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
