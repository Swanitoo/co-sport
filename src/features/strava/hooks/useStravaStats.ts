"use client";

import { useEffect, useState } from "react";
import { ActivityStats } from "../types";
import { formatPace } from "../utils/activity-utils";

interface UseStravaStatsOptions {
  formatValues?: boolean;
}

interface FormattedStravaStats extends ActivityStats {
  formattedRunningPace?: string;
  formattedCyclingSpeed?: string;
}

export function useStravaStats(
  userId: string,
  options: UseStravaStatsOptions = {}
) {
  const [stats, setStats] = useState<FormattedStravaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { formatValues = true } = options;

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}/strava-stats`);

        if (!response.ok) {
          throw new Error(
            `Erreur lors de la récupération des statistiques Strava (${response.status})`
          );
        }

        const data: ActivityStats = await response.json();

        // Formatter les valeurs si demandé
        if (formatValues) {
          const formatted: FormattedStravaStats = {
            ...data,
            formattedRunningPace: data.runningPace
              ? formatPace(data.runningPace)
              : undefined,
            formattedCyclingSpeed: data.cyclingSpeed
              ? `${data.cyclingSpeed} km/h`
              : undefined,
          };
          setStats(formatted);
        } else {
          setStats(data);
        }
      } catch (err) {
        console.error(
          "Erreur lors de la récupération des statistiques Strava:",
          err
        );
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId, formatValues]);

  return {
    stats,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      // Réinitialiser l'état et lancer une nouvelle requête
      setStats(null);
      setError(null);
    },
  };
}
