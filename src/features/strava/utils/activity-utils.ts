import { StravaActivity } from "@prisma/client";
import { ActivityTypeStats, StravaActivityAPI } from "../types";

/**
 * Convertit une activité Strava de l'API en format pour la base de données
 */
export function convertStravaActivityForDb(
  activity: StravaActivityAPI,
  userId: string
) {
  return {
    id: activity.id.toString(),
    userId,
    name: activity.name,
    distance: activity.distance,
    movingTime: activity.moving_time,
    elapsedTime: activity.elapsed_time,
    activityType: activity.type || activity.sport_type,
    startDate: new Date(activity.start_date),
    startDateLocal: new Date(activity.start_date_local),
    timezone: activity.timezone,
    achievementCount: activity.achievement_count,
    kudosCount: activity.kudos_count,
    commentCount: activity.comment_count,
    athleteCount: activity.athlete_count,
    photoCount: activity.photo_count,
    mapId: activity.map?.id,
    mapPolyline: activity.map?.summary_polyline,
    averageSpeed: activity.average_speed,
    maxSpeed: activity.max_speed,
    totalElevationGain: activity.total_elevation_gain,
    // Champs optionnels
    averageCadence: activity.average_cadence,
    averageWatts: activity.average_watts,
    weightedAverageWatts: activity.weighted_average_watts,
    kilojoules: activity.kilojoules,
    deviceWatts: activity.device_watts,
    maxWatts: activity.max_watts,
    averageHeartrate: activity.average_heartrate,
    maxHeartrate: activity.max_heartrate,
    sufferScore: activity.suffer_score,
    description: activity.description,
    locationCity: activity.location_city,
    locationState: activity.location_state,
    locationCountry: activity.location_country,
    averageSwimCadence: activity.average_swim_cadence,
    averageRunCadence: activity.average_run_cadence,
    totalStrokes: activity.total_strokes,
    poolLength: activity.pool_length,
  };
}

/**
 * Calcule l'allure en min:sec/km à partir de la distance et du temps
 * @param distance - Distance en mètres
 * @param time - Temps en secondes
 * @returns Allure en secondes par kilomètre
 */
export function calculatePace(distance: number, time: number): number {
  if (distance <= 0 || time <= 0) return 0;

  // Conversion en km
  const distanceKm = distance / 1000;

  // Calcul des secondes par km
  return Math.round(time / distanceKm);
}

/**
 * Calcule la vitesse moyenne en km/h
 * @param distance - Distance en mètres
 * @param time - Temps en secondes
 * @returns Vitesse en km/h
 */
export function calculateSpeed(distance: number, time: number): number {
  if (distance <= 0 || time <= 0) return 0;

  // Conversion en km et heures
  const distanceKm = distance / 1000;
  const timeHours = time / 3600;

  // Vitesse en km/h avec une décimale
  return parseFloat((distanceKm / timeHours).toFixed(1));
}

/**
 * Formate une allure en secondes/km au format min:sec/km
 * @param pace - Allure en secondes par kilomètre
 * @returns Allure formatée (ex: "5:20/km")
 */
export function formatPace(pace: number | null | undefined): string {
  if (!pace || pace <= 0) return "-";

  const minutes = Math.floor(pace / 60);
  const seconds = Math.floor(pace % 60);

  return `${minutes}:${seconds.toString().padStart(2, "0")}/km`;
}

/**
 * Vérifie si une allure est dans une plage donnée
 */
export function isPaceInRange(
  pace: number,
  minPace?: number,
  maxPace?: number
): boolean {
  if (!pace) return false;

  // Si la pace est 0, c'est une valeur non définie
  if (pace === 0) return false;

  // Min pace signifie allure la plus rapide (valeur numérique plus petite)
  if (minPace && pace < minPace) return false;

  // Max pace signifie allure la plus lente (valeur numérique plus grande)
  if (maxPace && pace > maxPace) return false;

  return true;
}

/**
 * Vérifie si une vitesse est dans une plage donnée
 */
export function isSpeedInRange(
  speed: number,
  minSpeed?: number,
  maxSpeed?: number
): boolean {
  if (!speed) return false;

  // Si la vitesse est 0, c'est une valeur non définie
  if (speed === 0) return false;

  // Min speed signifie vitesse minimale
  if (minSpeed && speed < minSpeed) return false;

  // Max speed signifie vitesse maximale
  if (maxSpeed && speed > maxSpeed) return false;

  return true;
}

/**
 * Vérifie si une distance est supérieure ou égale à une distance minimale
 */
export function isDistanceInRange(
  distance: number | null | undefined,
  minDistance?: number
): boolean {
  if (!distance) return false;

  if (minDistance && distance < minDistance) return false;

  return true;
}

/**
 * Calcule les statistiques pour un type d'activité spécifique
 */
export function calculateTypeStats(
  type: string,
  activities: StravaActivity[]
): ActivityTypeStats {
  // Filtre les activités par type
  const filteredActivities = activities.filter(
    (activity) => activity.activityType === type
  );

  if (filteredActivities.length === 0) {
    return {
      count: 0,
      totalDistance: 0,
      totalElevation: 0,
      totalDuration: 0,
      averageDistance: 0,
      averageElevation: 0,
      averageDuration: 0,
    };
  }

  // Calcule les totaux
  const count = filteredActivities.length;
  const totalDistance = filteredActivities.reduce(
    (sum, activity) => sum + activity.distance,
    0
  );
  const totalElevation = filteredActivities.reduce(
    (sum, activity) => sum + (activity.totalElevationGain || 0),
    0
  );
  const totalDuration = filteredActivities.reduce(
    (sum, activity) => sum + activity.movingTime,
    0
  );

  // Calcule les moyennes
  const averageDistance = totalDistance / count;
  const averageElevation = totalElevation / count;
  const averageDuration = totalDuration / count;

  // Calcule l'allure moyenne (course à pied) ou la vitesse moyenne (vélo)
  let averagePace: number | undefined;
  let averageSpeed: number | undefined;

  if (type.toLowerCase().includes("run")) {
    averagePace = calculatePace(totalDistance, totalDuration);
  }

  if (type.toLowerCase().includes("ride")) {
    averageSpeed = calculateSpeed(totalDistance, totalDuration);
  }

  return {
    count,
    totalDistance,
    totalElevation,
    totalDuration,
    averageDistance,
    averageElevation,
    averageDuration,
    averagePace,
    averageSpeed,
  };
}

/**
 * Obtient la première et dernière activité d'un ensemble
 * @returns [première, dernière]
 */
export function getFirstAndLastActivity(activities: any[]): [Date, Date] {
  if (!activities.length) {
    return [new Date(), new Date()];
  }

  // Trier par date
  const sorted = [...activities].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  return [
    new Date(sorted[0].startDate),
    new Date(sorted[sorted.length - 1].startDate),
  ];
}
