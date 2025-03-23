import { prisma } from "@/prisma";
import { BADGES } from "./badge.config";
import { UserBadge } from "./badge.schemas";

export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  const badges = await prisma.userBadge.findMany({
    where: { userId },
  });

  return badges.map((badge: any) => ({
    badgeId: badge.badgeId,
    completedAt: badge.completedAt,
  }));
}

export async function calculateUserBadges(userId: string): Promise<string[]> {
  // Récupérer les activités Strava de l'utilisateur
  const stravaActivities = await prisma.stravaActivity.findMany({
    where: { userId },
  });

  // Pas d'activités, pas de badges
  if (stravaActivities.length === 0) {
    return [];
  }

  // Calculer les métriques globales
  const totalActivities = stravaActivities.length;
  const totalElevation = stravaActivities.reduce(
    (sum, activity) => sum + (activity.totalElevationGain || 0),
    0
  );
  const totalDistance = stravaActivities.reduce(
    (sum, activity) => sum + (activity.distance / 1000 || 0),
    0
  );
  const uniqueSports = Array.from(
    new Set(stravaActivities.map((a) => a.activityType))
  );

  // Calculer l'allure moyenne des courses à pied
  let avgRunningPace: number | undefined;
  let isRunningWithElevation = false;
  const runningActivities = stravaActivities.filter(
    (activity) =>
      activity.activityType === "Run" || activity.activityType === "VirtualRun"
  );

  if (runningActivities.length > 0) {
    const totalRunningTime = runningActivities.reduce(
      (sum, activity) => sum + activity.movingTime,
      0
    );
    const totalRunningDistance = runningActivities.reduce(
      (sum, activity) => sum + activity.distance,
      0
    );

    // Vérifier si les courses comportent du dénivelé significatif
    const totalRunningElevation = runningActivities.reduce(
      (sum, activity) => sum + (activity.totalElevationGain || 0),
      0
    );

    // On considère qu'il y a du dénivelé significatif si en moyenne
    // on a plus de 50m de dénivelé par 5km de course
    if (totalRunningDistance > 0) {
      const elevationRatio =
        totalRunningElevation / (totalRunningDistance / 5000);
      isRunningWithElevation = elevationRatio > 50;
      avgRunningPace = totalRunningTime / (totalRunningDistance / 1000);
    }
  }

  // Vérifier quels badges sont complétés
  const completedBadgeIds: string[] = [];

  for (const badge of BADGES) {
    let isCompleted = true;

    if (
      badge.requirements.totalActivities &&
      totalActivities < badge.requirements.totalActivities
    ) {
      isCompleted = false;
    }

    if (
      badge.requirements.elevation &&
      totalElevation < badge.requirements.elevation
    ) {
      isCompleted = false;
    }

    if (
      badge.requirements.distance &&
      totalDistance < badge.requirements.distance
    ) {
      isCompleted = false;
    }

    if (badge.requirements.longRunDistance) {
      // Vérifier si au moins une activité de course dépasse la distance minimale requise
      const hasLongRun = stravaActivities.some(
        (activity) =>
          (activity.activityType === "Run" ||
            activity.activityType === "VirtualRun" ||
            activity.activityType === "TrailRun") &&
          activity.distance >= badge.requirements.longRunDistance!
      );

      if (!hasLongRun) {
        isCompleted = false;
      }
    }

    if (badge.requirements.runningPace) {
      // Pour le badge Rapide, on adapte le seuil selon la présence de dénivelé
      const paceThreshold = isRunningWithElevation ? 450 : 360; // 7min30 ou 6min en secondes

      if (!avgRunningPace || avgRunningPace > paceThreshold) {
        isCompleted = false;
      }
    }

    if (badge.requirements.sports) {
      // Vérifier si l'utilisateur a suffisamment d'activités pour chaque sport requis
      const sportsCount: Record<string, number> = {};
      for (const activity of stravaActivities) {
        sportsCount[activity.activityType] =
          (sportsCount[activity.activityType] || 0) + 1;
      }

      // Au moins une activité dans chacun des sports listés
      const hasSports = badge.requirements.sports.some(
        (sport) => sportsCount[sport] >= 1
      );
      if (!hasSports) {
        isCompleted = false;
      }
    }

    if (isCompleted) {
      completedBadgeIds.push(badge.id);

      try {
        // Chercher si ce badge a déjà été enregistré
        const existingBadge = await prisma.userBadge.findFirst({
          where: { userId, badgeId: badge.id },
        });

        if (!existingBadge) {
          // Enregistrer le badge complété
          await prisma.userBadge.create({
            data: {
              userId,
              badgeId: badge.id,
              completedAt: new Date(),
            },
          });
        }
      } catch (error) {
        console.error("Erreur lors de l'enregistrement du badge:", error);
      }
    }
  }

  return completedBadgeIds;
}

// API pour mettre à jour les paramètres d'affichage des badges
export async function updateUserBadgeSettings(
  userId: string,
  showBadges: boolean
) {
  return fetch("/api/badges", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ showBadges }),
  });
}
