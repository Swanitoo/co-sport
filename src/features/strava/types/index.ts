/**
 * Types pour les activités Strava de l'API
 */
export interface StravaActivityAPI {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  sport_type: string;
  start_date: string;
  start_date_local: string;
  timezone: string;
  achievement_count: number;
  kudos_count: number;
  comment_count: number;
  athlete_count: number;
  photo_count: number;
  map: {
    id: string;
    summary_polyline: string;
  };
  average_speed: number;
  max_speed: number;
  average_cadence?: number;
  average_watts?: number;
  weighted_average_watts?: number;
  kilojoules?: number;
  device_watts?: boolean;
  max_watts?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  suffer_score?: number;
  has_kudoed: boolean;
  description?: string;
  calories?: number;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  average_temp?: number;
  average_swim_cadence?: number;
  average_run_cadence?: number;
  total_strokes?: number;
  pool_length?: number;
}

/**
 * Types pour les statistiques d'activités
 */
export interface ActivityStats {
  totalActivities: number;
  totalDistance: number;
  totalElevation: number;
  totalDuration: number;
  activitiesByType: Record<string, ActivityTypeStats>;
  runningPace?: number; // Moyenne au km pour la course à pied (secondes/km)
  cyclingSpeed?: number; // Vitesse moyenne à vélo (km/h)
  swimPace?: number; // Moyenne aux 100m en natation (secondes/100m)
}

export interface ActivityTypeStats {
  count: number;
  totalDistance: number;
  totalElevation: number;
  totalDuration: number;
  averageDistance: number;
  averageElevation: number;
  averageDuration: number;
  averagePace?: number; // Pour les types course
  averageSpeed?: number; // Pour les types vélo
}

/**
 * Types pour les filtres sportifs
 */
export interface SportPerformanceFilter {
  minRunPace?: number; // Allure minimale en secondes/km
  maxRunPace?: number; // Allure maximale en secondes/km
  minCyclingSpeed?: number; // Vitesse minimale en km/h
  maxCyclingSpeed?: number; // Vitesse maximale en km/h
  minDistance?: number; // Distance minimale parcourue (km)
  maxDistance?: number; // Distance maximale parcourue (km)
  requiredBadges?: string[]; // Badges requis du créateur
}

/**
 * Types pour les performances ITRA (International Trail Running Association)
 */
export interface ItraPerformance {
  itraPoints?: number; // Points ITRA
  performanceIndex?: number; // Indice de performance
  mountainLevel?: number; // Niveau montagne (1-5)
}

/**
 * Options pour le hook useStravaStats
 */
export interface StravaStatsOptions {
  userId: string;
  formatValues?: boolean;
}

/**
 * Statistiques formatées pour l'affichage
 */
export interface FormattedStats {
  runningPace: string;
  cyclingSpeed: string;
  totalDistance: string;
  totalElevation: string;
  totalDuration: string;
}
