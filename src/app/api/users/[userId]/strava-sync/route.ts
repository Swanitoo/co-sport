import { syncUserActivitiesAndStats } from "@/features/strava/services/strava-activity.service";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Point d'entrée pour synchroniser les activités Strava d'un utilisateur
 * et mettre à jour ses statistiques sportives
 */
export async function POST(
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

    // Vérifier les autorisations (seul l'utilisateur lui-même ou un admin peut effectuer cette action)
    // @ts-ignore - La propriété isAdmin existe bien dans notre session personnalisée
    if (session.user.id !== targetUserId && !session.user.isAdmin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Synchroniser les activités et mettre à jour les statistiques
    const success = await syncUserActivitiesAndStats(targetUserId);

    if (!success) {
      return NextResponse.json(
        { error: "Échec de la synchronisation" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Activités et statistiques Strava synchronisées avec succès",
      success: true,
    });
  } catch (error) {
    console.error("Erreur lors de la synchronisation Strava:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
