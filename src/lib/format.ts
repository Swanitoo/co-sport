/**
 * Formate une distance (en mètres) en kilomètres avec une décimale
 */
export function formatDistance(meters: number): string {
  const km = meters / 1000;
  return `${km.toFixed(1)} km`;
}

/**
 * Formate une durée (en secondes) en heures et minutes
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h${minutes > 0 ? ` ${minutes}min` : ""}`;
  }

  return `${minutes} min`;
}

/**
 * Formate une élévation (en mètres) avec une unité
 */
export function formatElevation(meters: number): string {
  return `${Math.round(meters)}m`;
}

/**
 * Calcule et formate l'allure (min/km) à partir de la durée (en secondes) et de la distance (en mètres)
 */
export function formatPace(seconds: number, meters: number): string {
  if (meters === 0) return "N/A";

  const paceInSecondsPerKm = seconds / (meters / 1000);
  const paceMinutes = Math.floor(paceInSecondsPerKm / 60);
  const paceSeconds = Math.floor(paceInSecondsPerKm % 60);

  return `${paceMinutes}:${paceSeconds.toString().padStart(2, "0")}/km`;
}
