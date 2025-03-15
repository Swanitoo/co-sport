import { prisma } from "@/prisma";

/**
 * Type pour les statistiques Strava d'un utilisateur
 */
export type UserStravaStats = {
  id: string;
  stravaConnected: boolean;
  stravaId?: string;
  running?: {
    pace?: number;
    avgDistance?: number;
    totalDistance?: number;
    avgElevationPerRun?: number;
  };
  cycling?: {
    speed?: number;
    avgDistance?: number;
  };
  avgDistance?: number;
  itraPoints?: number;
  lastUpdated?: Date | null;
};

/**
 * Récupération des statistiques Strava directement depuis la base de données (côté serveur)
 * Cette fonction évite un appel API et récupère les données directement
 */
export async function getStravaStatsForUser(
  userId: string
): Promise<UserStravaStats> {
  try {
    // Récupérer les statistiques de l'utilisateur en base de données
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        stravaId: true,
        stravaRunningPace: true,
        stravaCyclingSpeed: true,
        stravaAvgDistance: true,
        stravaItraPoints: true,
        stravaStatsUpdatedAt: true,
        stravaConnected: true,
      },
    });

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Si l'utilisateur n'est pas connecté à Strava, retourner des données vides
    if (!user.stravaConnected) {
      return {
        id: user.id,
        stravaConnected: false,
      };
    }

    // Formater les statistiques par types de sport
    const stats: UserStravaStats = {
      id: user.id,
      stravaConnected: true,
      stravaId: user.stravaId || undefined,
      lastUpdated: user.stravaStatsUpdatedAt,
      avgDistance: user.stravaAvgDistance || undefined,
      itraPoints: user.stravaItraPoints || undefined,
    };

    // Statistiques de course à pied
    if (user.stravaRunningPace) {
      stats.running = {
        pace: user.stravaRunningPace,
        avgDistance: user.stravaAvgDistance || undefined,
        // Données estimées à partir des valeurs existantes
        totalDistance: user.stravaAvgDistance
          ? user.stravaAvgDistance *
            (user.stravaItraPoints ? user.stravaItraPoints / 100 : 10)
          : undefined,
        avgElevationPerRun: user.stravaAvgDistance
          ? Math.round(user.stravaAvgDistance * 15) // Estimation: ~15m d'élévation par km
          : undefined,
      };
    }

    // Statistiques de cyclisme
    if (user.stravaCyclingSpeed) {
      stats.cycling = {
        speed: user.stravaCyclingSpeed,
        avgDistance: user.stravaAvgDistance
          ? user.stravaAvgDistance * 1.5 // Les sorties vélo sont généralement plus longues
          : undefined,
      };
    }

    return stats;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des statistiques Strava:",
      error
    );
    // En cas d'erreur, renvoyer des données par défaut
    return {
      id: userId,
      stravaConnected: false,
    };
  }
}
