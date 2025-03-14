"use server";

import { requiredCurrentUser } from "@/auth/current-user";
import { revalidatePath } from "next/cache";
import { fetchAndStoreStravaActivities } from "./strava-activity.service";

/**
 * Action serveur pour déclencher la synchronisation des activités Strava
 * Cette fonction est appelée après l'authentification Strava réussie
 */
export async function syncStravaActivities() {
  try {
    const user = await requiredCurrentUser();

    if (!user.stravaConnected || !user.stravaToken) {
      return { success: false, error: "Utilisateur non connecté à Strava" };
    }

    const success = await fetchAndStoreStravaActivities(user.id);

    if (success) {
      // Revalidate the dashboard page to show the new activities
      revalidatePath("/dashboard");
      return { success: true };
    } else {
      return {
        success: false,
        error: "Erreur lors de la synchronisation des activités Strava",
      };
    }
  } catch (error) {
    console.error("Erreur lors de la synchronisation Strava:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la synchronisation",
    };
  }
}
