import { requiredCurrentUser } from "@/auth/current-user";
import { fetchAndStoreStravaActivities } from "@/features/strava/services/strava-activity.service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Vérifier que l'utilisateur est authentifié
    const user = await requiredCurrentUser();

    // Vérifier si l'utilisateur est connecté à Strava
    if (!user.stravaConnected) {
      return NextResponse.json(
        {
          success: false,
          message: "Utilisateur non connecté à Strava",
        },
        { status: 400 }
      );
    }

    // Synchroniser les activités
    console.log(
      `Démarrage de la synchronisation Strava pour l'utilisateur ${user.id}`
    );
    const syncResult = await fetchAndStoreStravaActivities(user.id);

    if (syncResult) {
      return NextResponse.json({
        success: true,
        message: "Activités Strava synchronisées avec succès",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Échec de la synchronisation des activités Strava",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erreur lors de la synchronisation Strava:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de la synchronisation Strava",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
