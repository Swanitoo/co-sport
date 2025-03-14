import { prisma } from "@/prisma";
import { ActivityStats, ActivityTypeStats, StravaActivityAPI } from "../types";
import {
  calculatePace,
  calculateSpeed,
  calculateTypeStats,
  convertStravaActivityForDb,
  isPaceInRange,
  isSpeedInRange,
} from "../utils/activity-utils";

/**
 * Rafraîchit le token d'accès Strava si nécessaire
 */
async function refreshStravaToken(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      stravaToken: true,
      stravaRefreshToken: true,
      stravaTokenExpiresAt: true,
    },
  });

  if (!user || !user.stravaRefreshToken) {
    console.log("Utilisateur non trouvé ou token de rafraîchissement manquant");
    return null;
  }

  // Vérifier si le token a expiré
  const currentTime = Math.floor(Date.now() / 1000);
  const tokenExpiresAt = user.stravaTokenExpiresAt || 0;

  // Si le token n'a pas expiré, le retourner
  if (tokenExpiresAt > currentTime + 60) {
    // Ajouter une marge de 60 secondes
    return user.stravaToken;
  }

  console.log("Token Strava expiré, rafraîchissement...");

  try {
    // Rafraîchir le token avec l'API Strava
    const response = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: user.stravaRefreshToken,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Erreur lors du rafraîchissement du token:", error);
      return null;
    }

    const data = await response.json();

    // Mettre à jour les tokens dans la base de données
    await prisma.user.update({
      where: { id: userId },
      data: {
        stravaToken: data.access_token,
        stravaRefreshToken: data.refresh_token,
        stravaTokenExpiresAt: data.expires_at,
      },
    });

    return data.access_token;
  } catch (error) {
    console.error("Erreur lors du rafraîchissement du token:", error);
    return null;
  }
}

/**
 * Récupère et stocke les activités Strava d'un utilisateur
 */
export async function fetchAndStoreStravaActivities(
  userId: string
): Promise<boolean> {
  try {
    // Rafraîchir le token si nécessaire
    const accessToken = await refreshStravaToken(userId);
    if (!accessToken) {
      console.log("Impossible d'obtenir un token d'accès valide");
      return false;
    }

    // Calculer la date d'il y a un an
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const afterTimestamp = Math.floor(oneYearAgo.getTime() / 1000);

    console.log(
      `Récupération des activités après ${new Date(afterTimestamp * 1000)}`
    );

    // Paramètres de pagination et de date
    let page = 1;
    const perPage = 50;
    let allActivities: StravaActivityAPI[] = [];
    let hasMorePages = true;

    // Récupérer toutes les pages d'activités
    while (hasMorePages) {
      const url = `https://www.strava.com/api/v3/athlete/activities?per_page=${perPage}&page=${page}&after=${afterTimestamp}`;

      console.log(`Récupération de la page ${page}...`);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(
          `Erreur lors de la récupération des activités (page ${page}):`,
          error
        );
        break;
      }

      const activities: StravaActivityAPI[] = await response.json();

      if (activities.length === 0) {
        hasMorePages = false;
      } else {
        allActivities = [...allActivities, ...activities];
        page++;
      }

      // Limiter le nombre de pages récupérées pour éviter des problèmes de rate limiting
      if (page > 10) {
        console.log("Limite de 10 pages atteinte, arrêt de la récupération");
        hasMorePages = false;
      }
    }

    console.log(`Total des activités récupérées: ${allActivities.length}`);

    if (allActivities.length === 0) {
      console.log("Aucune activité trouvée");
      return true; // Considérer comme un succès car aucune activité à traiter
    }

    // Stocker les activités dans la base de données
    const activityIds = new Set<string>();
    for (const activity of allActivities) {
      const activityData = convertStravaActivityForDb(activity, userId);
      activityIds.add(activityData.id);

      // Utiliser upsert pour éviter les doublons
      await prisma.stravaActivity.upsert({
        where: { id: activityData.id },
        update: activityData,
        create: activityData,
      });
    }

    console.log(`${activityIds.size} activités stockées avec succès`);

    // Mettre à jour les statistiques de performance de l'utilisateur
    await updateUserStravaStats(userId);

    return true;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des activités Strava:",
      error
    );
    return false;
  }
}

/**
 * Calcule et met à jour les statistiques sportives d'un utilisateur
 * basées sur ses activités Strava
 */
export async function updateUserStravaStats(userId: string): Promise<boolean> {
  try {
    // Récupérer uniquement les activités de l'année dernière
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Récupérer toutes les activités pour le calcul des statistiques
    const activities = await prisma.stravaActivity.findMany({
      where: {
        userId,
        startDate: {
          gte: oneYearAgo,
        },
      },
    });

    if (activities.length === 0) {
      console.log(`Aucune activité trouvée pour l'utilisateur ${userId}`);
      return false;
    }

    console.log(`Calcul des statistiques pour ${activities.length} activités`);

    // Séparer les activités par type
    const runningActivities = activities.filter((activity) =>
      activity.activityType.toLowerCase().includes("run")
    );

    const cyclingActivities = activities.filter((activity) =>
      activity.activityType.toLowerCase().includes("ride")
    );

    // Calculer l'allure moyenne en course à pied (secondes par km)
    let stravaRunningPace: number | null = null;
    if (runningActivities.length > 0) {
      // Calculer l'allure pour chaque activité de course
      const paces = runningActivities
        .map((activity) =>
          calculatePace(activity.distance, activity.movingTime)
        )
        .filter((pace) => pace > 0 && pace < 1000); // Filtrer les valeurs aberrantes

      if (paces.length > 0) {
        // Calculer la moyenne
        stravaRunningPace = Math.round(
          paces.reduce((sum, pace) => sum + pace, 0) / paces.length
        );
      }
    }

    // Calculer la vitesse moyenne à vélo (km/h)
    let stravaCyclingSpeed: number | null = null;
    if (cyclingActivities.length > 0) {
      // Calculer la vitesse pour chaque activité de vélo
      const speeds = cyclingActivities
        .map((activity) =>
          calculateSpeed(activity.distance, activity.movingTime)
        )
        .filter((speed) => speed > 0 && speed < 100); // Filtrer les valeurs aberrantes

      if (speeds.length > 0) {
        // Calculer la moyenne (arrondie à 1 décimale)
        stravaCyclingSpeed = parseFloat(
          (
            speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length
          ).toFixed(1)
        );
      }
    }

    // Calculer la distance moyenne par activité (km)
    const distances = activities
      .map((activity) => activity.distance / 1000)
      .filter((distance) => distance > 0);

    const stravaAvgDistance =
      distances.length > 0
        ? parseFloat(
            (
              distances.reduce((sum, distance) => sum + distance, 0) /
              distances.length
            ).toFixed(1)
          )
        : null;

    // ITRA points - calcul fictif pour illustration
    // Dans une vraie implémentation, il faudrait utiliser des formules spécifiques
    // basées sur le dénivelé, la distance, etc.
    const stravaItraPoints =
      runningActivities.length > 0
        ? Math.min(
            1500,
            Math.round(
              runningActivities.reduce(
                (sum, activity) =>
                  sum +
                  ((activity.distance / 1000) *
                    (activity.totalElevationGain || 0)) /
                    100,
                0
              )
            )
          )
        : null;

    // Mettre à jour le profil utilisateur avec les statistiques calculées
    await prisma.user.update({
      where: { id: userId },
      data: {
        // Utiliser une assertion de type pour contourner l'erreur TypeScript
        // Cette méthode est temporaire en attendant la régénération correcte des types
        stravaRunningPace,
        stravaCyclingSpeed,
        stravaAvgDistance,
        stravaItraPoints,
        stravaStatsUpdatedAt: new Date(),
      } as any, // Assertion de type pour éviter l'erreur
    });

    console.log(`Statistiques mises à jour pour l'utilisateur ${userId}`);
    return true;
  } catch (error) {
    console.error("Erreur lors du calcul des statistiques Strava:", error);
    return false;
  }
}

/**
 * Récupère les statistiques d'activité pour un utilisateur
 */
export async function getStravaActivityStats(
  userId: string
): Promise<ActivityStats> {
  try {
    // Vérifier si l'utilisateur existe et est connecté à Strava
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stravaConnected: true },
    });

    if (!user || !user.stravaConnected) {
      return {
        totalActivities: 0,
        totalDistance: 0,
        totalElevation: 0,
        totalDuration: 0,
        activitiesByType: {},
      };
    }

    // Récupérer les activités de l'utilisateur (limité à 12 mois)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const activities = await prisma.stravaActivity.findMany({
      where: {
        userId,
        startDate: {
          gte: oneYearAgo,
        },
      },
    });

    if (activities.length === 0) {
      return {
        totalActivities: 0,
        totalDistance: 0,
        totalElevation: 0,
        totalDuration: 0,
        activitiesByType: {},
      };
    }

    // Calculer les statistiques globales
    const totalActivities = activities.length;
    const totalDistance = activities.reduce(
      (sum, activity) => sum + activity.distance,
      0
    );
    const totalElevation = activities.reduce(
      (sum, activity) => sum + (activity.totalElevationGain || 0),
      0
    );
    const totalDuration = activities.reduce(
      (sum, activity) => sum + activity.movingTime,
      0
    );

    // Regrouper par type d'activité
    const activityTypes = Array.from(
      new Set(activities.map((a) => a.activityType))
    );
    const activitiesByType: Record<string, ActivityTypeStats> = {};

    activityTypes.forEach((type) => {
      activitiesByType[type] = calculateTypeStats(type, activities);
    });

    // Calculer l'allure moyenne pour la course à pied et la vitesse pour le vélo
    const runningStats = activitiesByType["Run"];
    const cyclingStats = activitiesByType["Ride"];

    return {
      totalActivities,
      totalDistance,
      totalElevation,
      totalDuration,
      activitiesByType,
      runningPace: runningStats?.averagePace,
      cyclingSpeed: cyclingStats?.averageSpeed,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return {
      totalActivities: 0,
      totalDistance: 0,
      totalElevation: 0,
      totalDuration: 0,
      activitiesByType: {},
    };
  }
}

/**
 * Récupère les activités récentes d'un utilisateur
 */
export async function getUserStravaActivities(userId: string, limit = 10) {
  try {
    const activities = await prisma.stravaActivity.findMany({
      where: {
        userId,
      },
      orderBy: {
        startDate: "desc",
      },
      take: limit,
    });

    return activities;
  } catch (error) {
    console.error("Erreur lors de la récupération des activités:", error);
    return [];
  }
}

/**
 * Recherche des utilisateurs par critères de performance
 */
export async function searchUsersByPerformance(params: {
  minRunPace?: number;
  maxRunPace?: number;
  minCyclingSpeed?: number;
  maxCyclingSpeed?: number;
  minDistance?: number;
}) {
  const {
    minRunPace,
    maxRunPace,
    minCyclingSpeed,
    maxCyclingSpeed,
    minDistance,
  } = params;

  try {
    const users = await prisma.user.findMany({
      where: {
        stravaConnected: true,
        // Impossible d'utiliser des opérations complexes ici directement
        // Nous récupérons tous les utilisateurs connectés et filtrons après
      },
      select: {
        id: true,
        name: true,
        image: true,
        sex: true,
        country: true,
        city: true,
        stravaRunningPace: true,
        stravaCyclingSpeed: true,
        stravaAvgDistance: true,
      } as any, // Assertion de type pour éviter l'erreur
    });

    // Filtrer les utilisateurs en fonction des critères
    return users.filter((user) => {
      // Critères de pace en course à pied
      if (minRunPace || maxRunPace) {
        if (
          !isPaceInRange(
            (user as any).stravaRunningPace || 0,
            minRunPace,
            maxRunPace
          )
        ) {
          return false;
        }
      }

      // Critères de vitesse à vélo
      if (minCyclingSpeed || maxCyclingSpeed) {
        if (
          !isSpeedInRange(
            (user as any).stravaCyclingSpeed || 0,
            minCyclingSpeed,
            maxCyclingSpeed
          )
        ) {
          return false;
        }
      }

      // Critère de distance moyenne
      if (
        minDistance &&
        (!(user as any).stravaAvgDistance ||
          (user as any).stravaAvgDistance < minDistance)
      ) {
        return false;
      }

      return true;
    });
  } catch (error) {
    console.error("Erreur lors de la recherche des utilisateurs:", error);
    return [];
  }
}

/**
 * Synchronise les activités Strava pour un utilisateur et met à jour ses statistiques
 */
export async function syncUserActivitiesAndStats(
  userId: string
): Promise<boolean> {
  try {
    // Synchroniser les activités
    const syncResult = await fetchAndStoreStravaActivities(userId);

    // Si la synchronisation a échoué, ne pas calculer les statistiques
    if (!syncResult) {
      console.log(
        `Échec de la synchronisation des activités pour l'utilisateur ${userId}`
      );
      return false;
    }

    // Calculer et mettre à jour les statistiques
    const statsResult = await updateUserStravaStats(userId);

    return statsResult;
  } catch (error) {
    console.error("Erreur lors de la synchronisation complète:", error);
    return false;
  }
}
