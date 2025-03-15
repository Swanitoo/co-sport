import { prisma } from "@/prisma";

// Type pour les statistiques Strava adaptées au dashboard
export type DashboardStravaStats = {
  id: string;
  stravaConnected: boolean;
  stravaId?: string;
  running?: {
    pace?: number;
  };
  cycling?: {
    speed?: number;
  };
  avgDistance?: number;
  // Le dénivelé sera calculé à partir des activités récentes
  itraPoints?: number;
  lastSyncDate?: string; // Format ISO
};

/**
 * Vérifier si une valeur est raisonnable
 */
const isReasonableValue = (
  value: number | null | undefined,
  min: number,
  max: number
): boolean => {
  if (value === null || value === undefined) return false;
  return value >= min && value <= max;
};

/**
 * Récupérer les statistiques Strava formatées pour le dashboard
 */
export async function getStravaDashboardStats(
  userId: string
): Promise<DashboardStravaStats> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        stravaId: true,
        stravaConnected: true,
        stravaRunningPace: true,
        stravaCyclingSpeed: true,
        stravaAvgDistance: true,
        stravaItraPoints: true,
      },
    });

    if (!user || !user.stravaConnected) {
      return {
        id: userId,
        stravaConnected: false,
      };
    }

    // Vérifier si la vitesse de cyclisme est raisonnable (entre 5 et 50 km/h)
    const cyclingSpeed = isReasonableValue(user.stravaCyclingSpeed, 5, 50)
      ? user.stravaCyclingSpeed
      : undefined;

    // Vérifier si la distance moyenne est raisonnable (entre 0.5 et 200 km)
    let avgDistanceValue: number | undefined = undefined;
    if (
      user.stravaAvgDistance !== null &&
      user.stravaAvgDistance !== undefined
    ) {
      if (user.stravaAvgDistance >= 0.5 && user.stravaAvgDistance <= 200) {
        avgDistanceValue = user.stravaAvgDistance;
      }
    }

    return {
      id: user.id,
      stravaConnected: user.stravaConnected,
      stravaId: user.stravaId || undefined,
      running: user.stravaRunningPace
        ? {
            pace: user.stravaRunningPace,
          }
        : undefined,
      cycling: cyclingSpeed
        ? {
            speed: cyclingSpeed,
          }
        : undefined,
      avgDistance: avgDistanceValue,
      itraPoints: user.stravaItraPoints || undefined,
      // Utiliser la date actuelle comme date de synchronisation par défaut
      lastSyncDate: new Date().toISOString(),
    };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des statistiques Strava:",
      error
    );
    return {
      id: userId,
      stravaConnected: false,
    };
  }
}
