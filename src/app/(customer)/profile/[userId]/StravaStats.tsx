"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  formatDistance as formatDistanceLib,
  formatDuration as formatDurationLib,
  formatElevation as formatElevationLib,
} from "@/lib/format";
import { Activity, BarChart, Bike, Timer, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

// Type adapté aux données disponibles
type StravaUserStats = {
  id: string;
  stravaConnected: boolean;
  stravaId?: string;
  // Stats de course à pied
  running?: {
    pace?: number; // en secondes par km
    avgDistance?: number;
    totalDistance?: number;
    avgElevationPerRun?: number;
  };
  // Stats de cyclisme
  cycling?: {
    speed?: number; // en km/h
    avgDistance?: number;
  };
  avgDistance?: number; // en km
  itraPoints?: number;
  lastUpdated?: string;
};

// Ajouter le type pour les activités Strava
type StravaActivity = {
  id: string;
  name: string;
  distance: number;
  movingTime: number;
  elapsedTime: number;
  totalElevationGain?: number | null;
  activityType: string;
  startDate: Date;
  locationCity?: string | null;
  locationCountry?: string | null;
};

type StravaStatsProps = {
  userId: string;
  // Désactiver les appels API si les données sont passées directement
  initialData?: StravaUserStats;
  recentActivities?: StravaActivity[]; // Ajouter les activités récentes
  disableAutoFetch?: boolean;
};

// Format d'allure pour la course (min:sec par km)
const formatPace = (paceInSeconds: number | undefined): string => {
  if (!paceInSeconds || isNaN(paceInSeconds)) return "-- /km";

  const minutes = Math.floor(paceInSeconds / 60);
  const seconds = Math.floor(paceInSeconds % 60);

  return `${minutes}:${seconds.toString().padStart(2, "0")} /km`;
};

// Format de vitesse pour le vélo (km/h)
const formatSpeed = (speedKmh: number | undefined): string => {
  if (!speedKmh || isNaN(speedKmh)) return "-- km/h";

  return `${speedKmh.toFixed(1)} km/h`;
};

// Fonction pour formater la distance (km)
const formatDistance = (meters: number): string => {
  if (typeof meters !== "number" || isNaN(meters) || meters < 10) {
    return "N/A";
  }
  return formatDistanceLib(meters);
};

// Fonction pour formater la durée
const formatDuration = (seconds: number): string => {
  if (typeof seconds !== "number" || isNaN(seconds)) {
    return "N/A";
  }
  return formatDurationLib(seconds);
};

// Fonction pour formater l'élévation (m)
const formatElevation = (meters: number): string => {
  if (typeof meters !== "number" || isNaN(meters)) {
    return "N/A";
  }
  return formatElevationLib(meters);
};

// Format des points ITRA
const formatItraPoints = (points: number | undefined): string => {
  if (!points || isNaN(points)) return "-- pts";

  return `${points} pts`;
};

// Logo Strava en SVG
const StravaLogo = () => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    className="mr-2 text-[#FC4C02]"
    fill="currentColor"
  >
    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
  </svg>
);

export const StravaStats = ({
  userId,
  initialData,
  recentActivities = [], // Valeur par défaut
  disableAutoFetch = false,
}: StravaStatsProps) => {
  const [loading, setLoading] = useState(!initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<StravaUserStats | null>(
    initialData || null
  );
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async (showToast = false) => {
    try {
      if (showToast) {
        setRefreshing(true);
        toast.loading("Récupération des données Strava en cours...");
      } else {
        setLoading(true);
      }

      const response = await fetch(`/api/users/${userId}/strava-stats`);

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des statistiques Strava");
      }

      const data = await response.json();
      setStats(data);

      if (showToast) {
        toast.success(
          "Les statistiques Strava ont été mises à jour avec succès"
        );
      }
    } catch (err) {
      console.error("Erreur de chargement des stats Strava:", err);
      setError("Impossible de charger les statistiques Strava");

      if (showToast) {
        toast.error("Impossible de récupérer les statistiques Strava");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Si des données initiales sont fournies ou si autoFetch est désactivé, ne pas charger
    if (initialData || disableAutoFetch) return;

    fetchStats(false);
  }, [userId, initialData, disableAutoFetch]);

  // Calculer le dénivelé moyen à partir des activités récentes
  const avgElevation = useMemo(() => {
    if (!recentActivities || recentActivities.length === 0) return undefined;

    // Filtrer les activités qui ont un dénivelé
    const activitiesWithElevation = recentActivities.filter(
      (activity) =>
        activity.totalElevationGain && activity.totalElevationGain > 0
    );

    if (activitiesWithElevation.length === 0) return undefined;

    // Calculer la moyenne
    const totalElevation = activitiesWithElevation.reduce(
      (sum, activity) => sum + (activity.totalElevationGain || 0),
      0
    );

    return totalElevation / activitiesWithElevation.length;
  }, [recentActivities]);

  // Calculer l'allure moyenne des courses à pied récentes
  const avgRunningPace = useMemo(() => {
    if (!recentActivities || recentActivities.length === 0) return undefined;

    const runningActivities = recentActivities.filter(
      (activity) =>
        activity.activityType === "Run" ||
        activity.activityType === "VirtualRun"
    );

    if (runningActivities.length === 0) return undefined;

    // Calculer l'allure moyenne (secondes par km)
    const totalMovingTime = runningActivities.reduce(
      (sum, activity) => sum + activity.movingTime,
      0
    );
    const totalDistance = runningActivities.reduce(
      (sum, activity) => sum + activity.distance,
      0
    );

    if (totalDistance === 0) return undefined;

    return totalMovingTime / (totalDistance / 1000);
  }, [recentActivities]);

  // Calculer la vitesse moyenne à vélo
  const avgCyclingSpeed = useMemo(() => {
    if (!recentActivities || recentActivities.length === 0) return undefined;

    const cyclingActivities = recentActivities.filter(
      (activity) =>
        activity.activityType === "Ride" ||
        activity.activityType === "VirtualRide"
    );

    if (cyclingActivities.length === 0) return undefined;

    // Calculer la vitesse moyenne (m/s)
    const totalDistance = cyclingActivities.reduce(
      (sum, activity) => sum + activity.distance,
      0
    );
    const totalMovingTime = cyclingActivities.reduce(
      (sum, activity) => sum + activity.movingTime,
      0
    );

    if (totalMovingTime === 0) return undefined;

    return totalDistance / totalMovingTime;
  }, [recentActivities]);

  // Calculer la distance moyenne
  const avgDistance = useMemo(() => {
    if (!recentActivities || recentActivities.length === 0) return undefined;

    // Filtrer les activités avec une distance valide (> 0)
    const validActivities = recentActivities.filter(
      (activity) => activity.distance > 0
    );

    if (validActivities.length === 0) return undefined;

    // Calculer la distance moyenne (m)
    const totalDistance = validActivities.reduce(
      (sum, activity) => sum + activity.distance,
      0
    );

    return totalDistance / validActivities.length;
  }, [recentActivities]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <StravaLogo />
            <Skeleton className="h-6 w-48" />
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            <div className="flex items-center">
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-5 w-28" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <StravaLogo />
            Statistiques Strava
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {error || "Aucune donnée Strava disponible"}
          </div>
        </CardHeader>
      </Card>
    );
  }

  // Formater la date de mise à jour
  const lastUpdated = stats.lastUpdated
    ? new Date(stats.lastUpdated).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  // URL vers le profil Strava de l'utilisateur
  const stravaProfileUrl = stats.stravaId
    ? `https://www.strava.com/athletes/${stats.stravaId}`
    : "https://www.strava.com/";

  // Déterminer les sports pratiqués en fonction des données disponibles
  const sportsPratiques = [];
  if (stats.running?.pace) sportsPratiques.push("Course à pied");
  if (stats.cycling?.speed) sportsPratiques.push("Cyclisme");
  if (stats.itraPoints) sportsPratiques.push("Trail");

  return (
    <Card className="w-full">
      <CardHeader className="border-t-2 border-[#FC4C02]">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <StravaLogo />
              Statistiques Strava
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              {lastUpdated
                ? `Dernière mise à jour : ${lastUpdated}`
                : "Données synchronisées avec Strava"}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stats">
          <TabsList className="mb-4">
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
            <TabsTrigger value="activities">Activités récentes</TabsTrigger>
          </TabsList>

          <TabsContent value="stats">
            <div className="space-y-6">
              {/* Résumé du profil sportif */}
              {sportsPratiques.length > 0 && (
                <div className="mb-4 rounded-lg bg-muted p-3">
                  <h4 className="mb-2 flex items-center text-sm font-medium">
                    <Trophy className="mr-2 size-4" />
                    Profil sportif
                  </h4>
                  <div className="text-xs text-muted-foreground">
                    <p className="mb-1">
                      <span className="font-medium">Sports pratiqués :</span>{" "}
                      {sportsPratiques.join(", ")}
                    </p>
                    {stats.avgDistance && (
                      <p className="mb-1">
                        <span className="font-medium">Distance moyenne :</span>{" "}
                        {formatDistance(stats.avgDistance)}
                      </p>
                    )}
                    {stats.itraPoints && (
                      <p>
                        <span className="font-medium">Points ITRA :</span>{" "}
                        {formatItraPoints(stats.itraPoints)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Supprimer les sections séparées pour course à pied et trail */}
              {(stats.running || stats.itraPoints || avgElevation) && (
                <div className="mb-4">
                  <h4 className="mb-2 flex items-center text-sm font-medium">
                    <Activity className="mr-2 size-4" />
                    Course à pied / Trail
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {/* Allure de course */}
                    {(avgRunningPace ||
                      (stats.running && stats.running.pace)) && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 text-xs"
                      >
                        <Timer className="mr-1 size-3" />
                        Allure:{" "}
                        {formatPace(avgRunningPace || stats.running?.pace || 0)}
                      </Badge>
                    )}

                    {/* Distance moyenne */}
                    {(avgDistance || stats.avgDistance) && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 text-xs"
                      >
                        Distance moyenne:{" "}
                        {formatDistance(avgDistance || stats.avgDistance || 0)}
                      </Badge>
                    )}

                    {/* Dénivelé moyen */}
                    {avgElevation && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 text-xs"
                      >
                        <BarChart className="mr-1 size-3" />
                        Dénivelé moyen: {formatElevation(avgElevation)}
                      </Badge>
                    )}

                    {/* Points ITRA */}
                    {stats.itraPoints && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 text-xs"
                      >
                        <Trophy className="mr-1 size-3" />
                        Points ITRA: {formatItraPoints(stats.itraPoints)}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Cycling stats */}
              {stats.cycling && (
                <div className="mb-4">
                  <h4 className="mb-2 flex items-center text-sm font-medium">
                    <Bike className="mr-2 size-4" />
                    Cyclisme
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(avgCyclingSpeed || stats.cycling.speed) && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 text-xs"
                      >
                        <Timer className="mr-1 size-3" />
                        Vitesse:{" "}
                        {formatSpeed(
                          avgCyclingSpeed || stats.cycling.speed || 0
                        )}
                      </Badge>
                    )}
                    {(avgDistance || stats.avgDistance) && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 text-xs"
                      >
                        Distance moyenne:{" "}
                        {formatDistance(
                          (avgDistance || stats.avgDistance || 0) * 1.5
                        )}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Lien vers Strava */}
              <div className="mt-4 text-center">
                <a
                  href={stravaProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-muted-foreground hover:text-primary"
                >
                  <StravaLogo />
                  Voir le profil complet sur Strava
                </a>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activities">
            {recentActivities && recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.slice(0, 5).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex flex-col space-y-2 rounded-md border p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate text-sm font-medium">
                        {activity.name}
                      </span>
                      <Badge variant="outline">{activity.activityType}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <div>
                        <span>Distance</span>
                        <p className="font-medium text-foreground">
                          {formatDistance(activity.distance)}
                        </p>
                      </div>
                      <div>
                        <span>Durée</span>
                        <p className="font-medium text-foreground">
                          {formatDuration(activity.movingTime)}
                        </p>
                      </div>
                      <div>
                        <span>D+</span>
                        <p className="font-medium text-foreground">
                          {formatElevation(activity.totalElevationGain || 0)}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(activity.startDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                Aucune activité récente. Synchronisez vos activités Strava.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
