"use client";

import { StravaLogo, StravaLogoWhite } from "@/components/StravaLogo";
import { Badge } from "@/components/ui/badge";
import { BadgeCard } from "@/components/ui/badges/badge-card";
import { BadgeSettings } from "@/components/ui/badges/badge-settings";
import { Badge as BadgeType } from "@/components/ui/badges/badge.schemas";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  formatDuration,
  formatDistance as libFormatDistance,
  formatElevation as libFormatElevation,
} from "@/lib/format";
import { ExternalLink, RotateCw } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DashboardStravaStats } from "../services/strava-dashboard.service";
import { syncStravaActivities } from "../services/strava-sync.action";

// Types pour les activités Strava (format base de données)
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
  // autres champs optionnels...
};

// Type pour les statistiques Strava
type StravaUserStats = {
  id: string;
  stravaConnected: boolean;
  stravaId?: string;
  // Stats de course à pied
  running?: {
    pace?: number; // en secondes par km
  };
  // Stats de cyclisme
  cycling?: {
    speed?: number; // en km/h
  };
  avgDistance?: number; // en km
  itraPoints?: number;
};

// Type pour les badges
type BadgesProps = {
  userBadges: Array<{ badgeId: string; completedAt: Date }>;
  completedBadgeIds: string[];
  badgesList: BadgeType[];
  showBadges: boolean;
  userId: string;
};

type StravaDashboardProps = {
  stats: DashboardStravaStats;
  recentActivities: StravaActivity[];
  isConnected: boolean;
  badges?: BadgesProps;
};

// Format d'allure pour la course (min:sec par km)
const formatPace = (secondsPerKm: number): string => {
  if (typeof secondsPerKm !== "number" || isNaN(secondsPerKm)) {
    return "N/A";
  }

  // Vérifier si l'allure est raisonnable (entre 3:00 et 15:00 min/km)
  if (secondsPerKm < 180 || secondsPerKm > 900) {
    return "N/A";
  }

  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.floor(secondsPerKm % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")} min/km`;
};

// Format de vitesse pour le vélo (km/h)
const formatSpeed = (speedMetersPerSecond: number): string => {
  if (typeof speedMetersPerSecond !== "number" || isNaN(speedMetersPerSecond)) {
    return "N/A";
  }

  // Vérifier si la vitesse est raisonnable (entre 5 et 50 km/h)
  const speedKmh = speedMetersPerSecond * 3.6;
  if (speedKmh < 5 || speedKmh > 50) {
    return "N/A";
  }

  return `${speedKmh.toFixed(1)} km/h`;
};

// Fonction pour formater la distance (km)
const formatDistance = (meters: number): string => {
  if (typeof meters !== "number" || isNaN(meters) || meters < 10) {
    return "N/A";
  }
  return libFormatDistance(meters);
};

// Fonction pour formater l'élévation (m)
const formatElevation = (meters: number): string => {
  if (typeof meters !== "number" || isNaN(meters)) {
    return "N/A";
  }
  return libFormatElevation(meters);
};

// Format des points ITRA
const formatItraPoints = (points: number | undefined): string => {
  if (!points || isNaN(points)) return "-- pts";

  return `${points} pts`;
};

// Format de durée en heures/minutes
const formatTimeHM = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// Traduction des types d'activités
const translateActivityType = (type: string) => {
  const translations: Record<string, string> = {
    Run: "Course",
    Ride: "Vélo",
    Swim: "Natation",
    Walk: "Marche",
    Hike: "Randonnée",
    WeightTraining: "Musculation",
    Workout: "Entraînement",
    Yoga: "Yoga",
    VirtualRide: "Vélo virtuel",
    VirtualRun: "Course virtuelle",
  };

  return translations[type] || type;
};

// Icône pour le type d'activité
const getActivityIcon = (type: string) => {
  switch (type) {
    case "Run":
    case "VirtualRun":
      return "🏃";
    case "Ride":
    case "VirtualRide":
      return "🚴";
    case "Swim":
      return "🏊";
    case "Walk":
      return "🚶";
    case "Hike":
      return "🥾";
    case "WeightTraining":
      return "🏋️";
    case "Yoga":
      return "🧘";
    default:
      return "🏅";
  }
};

export function StravaDashboard({
  stats,
  recentActivities,
  isConnected,
  badges,
}: StravaDashboardProps) {
  const params = useParams();
  const hasLocale = params.locale !== undefined;
  const locale = (params.locale as string) || "fr";

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("statistics");
  const [syncTime, setSyncTime] = useState<string>("");

  // Utiliser useEffect pour mettre à jour l'heure côté client uniquement
  useEffect(() => {
    setSyncTime(new Date().toLocaleString());
  }, []);

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

  // Calculer la distance moyenne de toutes les activités
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

  // Fonction pour synchroniser les activités Strava
  const handleSync = async () => {
    setIsLoading(true);
    try {
      const result = await syncStravaActivities();
      if (result.success) {
        toast.success("Activités Strava synchronisées avec succès!");
        // Mettre à jour l'heure de synchronisation
        setSyncTime(new Date().toLocaleString());
      } else {
        toast.error(result.error || "Erreur lors de la synchronisation");
      }
    } catch (error) {
      toast.error("Erreur lors de la synchronisation");
    } finally {
      setIsLoading(false);
    }
  };

  // Obtenir l'URL du profil Strava
  const stravaProfileUrl = stats.stravaId
    ? `https://www.strava.com/athletes/${stats.stravaId}`
    : "https://www.strava.com/";

  // Si l'utilisateur n'est pas connecté à Strava
  if (!isConnected) {
    return (
      <>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <StravaLogo />
            <CardTitle>Strava</CardTitle>
          </div>
          <CardDescription>
            Connectez-vous à Strava pour voir vos statistiques
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center">
          <div className="w-full text-center">
            <p className="mb-4 text-muted-foreground">
              Connectez votre compte Strava pour voir vos statistiques et
              activités récentes
            </p>
            <div className="w-full">
              <Link
                href="/api/auth/signin?provider=strava&callbackUrl=/dashboard"
                className="flex w-full items-center justify-center gap-2 rounded-md border-0 bg-[#FC4C02] px-4 py-2 text-white transition-colors hover:bg-[#E34000]"
              >
                <StravaLogoWhite />
                <span>Connecter avec Strava</span>
              </Link>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-xs italic text-muted-foreground">
            (En attente d'acceptation du site par Strava, possible que cela ne
            fonctionne pas)
          </p>
        </CardFooter>
      </>
    );
  }

  return (
    <>
      <CardHeader className="pb-2 pt-3">
        <div className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <StravaLogo />
            <CardTitle>Strava</CardTitle>
          </div>
          {isConnected && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSync}
              disabled={isLoading}
            >
              <RotateCw
                className={`mr-2 size-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Synchroniser
            </Button>
          )}
        </div>
        <CardDescription>Vos statistiques et activités Strava</CardDescription>
      </CardHeader>

      {!isConnected ? (
        <CardContent>
          <div className="flex flex-col items-center gap-4 p-8">
            <p className="text-center text-muted-foreground">
              Connectez votre compte Strava pour importer vos activités
              sportives
            </p>
            <Link
              href={`${
                hasLocale ? `/${locale}` : ""
              }/api/auth/signin?provider=strava&callbackUrl=${
                hasLocale ? `/${locale}` : ""
              }/dashboard`}
              className="flex items-center justify-center gap-2 rounded-md border-0 bg-[#FC4C02] px-4 py-2 text-white transition-colors hover:bg-[#E34000]"
            >
              <StravaLogoWhite />
              <span>Connecter avec Strava</span>
            </Link>
          </div>
        </CardContent>
      ) : (
        <>
          <CardContent className="p-3">
            <Tabs
              defaultValue="statistics"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="mb-2 w-full">
                <TabsTrigger value="statistics" className="flex-1">
                  Statistiques
                </TabsTrigger>
                <TabsTrigger value="activities" className="flex-1">
                  Activités Récentes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="statistics" className="py-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2 md:w-2/3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Course à pied - Allure
                      </span>
                      <span className="font-medium">
                        {formatPace(stats.running?.pace ?? avgRunningPace ?? 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Vélo - Vitesse
                      </span>
                      <span className="font-medium">
                        {formatSpeed(
                          stats.cycling?.speed ?? avgCyclingSpeed ?? 0
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Distance moyenne
                      </span>
                      <span className="font-medium">
                        {formatDistance((stats.avgDistance ?? 0) * 1000)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Dénivelé moyen
                      </span>
                      <span className="font-medium">
                        {formatElevation(avgElevation ?? 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Points ITRA</span>
                      <span className="font-medium">
                        {formatItraPoints(stats.itraPoints)}
                      </span>
                    </div>
                  </div>

                  {badges && (
                    <div className="mt-3 border-t pt-3 md:ml-4 md:mt-0 md:w-1/3 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                      <div className="mb-3 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium">Mes badges</div>
                        </div>
                        <div className="flex items-center gap-2 pr-2">
                          <span className="text-xs text-muted-foreground">
                            Visible
                          </span>
                          <BadgeSettings
                            userId={badges.userId}
                            showBadges={badges.showBadges}
                            compact={true}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <TooltipProvider>
                          {badges.badgesList.map((badge) => {
                            const isCompleted =
                              badges.completedBadgeIds.includes(badge.id);
                            const userBadge = badges.userBadges.find(
                              (ub) => ub.badgeId === badge.id
                            );

                            return (
                              <Tooltip key={badge.id}>
                                <TooltipTrigger asChild>
                                  <div>
                                    <BadgeCard
                                      badge={badge}
                                      isCompleted={isCompleted}
                                      completedAt={userBadge?.completedAt}
                                      compact={true}
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="border border-border bg-popover/95">
                                  <p className="text-sm text-foreground">
                                    {badge.description}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </TooltipProvider>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="activities">
                {recentActivities.length > 0 ? (
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
                          <Badge variant="outline">
                            {activity.activityType}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                          <div>
                            <span className="flex items-center gap-1">
                              <span className="text-[#FC4C02]">📏</span>{" "}
                              Distance
                            </span>
                            <p className="font-medium text-foreground">
                              {formatDistance(activity.distance)}
                            </p>
                          </div>
                          <div>
                            <span className="flex items-center gap-1">
                              <span className="text-[#FC4C02]">⏱️</span> Durée
                            </span>
                            <p className="font-medium text-foreground">
                              {formatDuration(activity.movingTime)}
                            </p>
                          </div>
                          <div>
                            <span className="flex items-center gap-1">
                              <span className="text-[#FC4C02]">⛰️</span> D+
                            </span>
                            <p className="font-medium text-foreground">
                              {formatElevation(
                                activity.totalElevationGain || 0
                              )}
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
          <CardFooter className="justify-between border-t px-5 py-2">
            <div className="text-xs text-muted-foreground">
              Dernière synchro: {syncTime || "N/A"}
            </div>
            <Link
              href={`https://www.strava.com/athletes/${stats.stravaId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-[#FC4C02] hover:underline"
            >
              <span>Voir mon profil Strava</span>
              <ExternalLink className="size-3" />
            </Link>
          </CardFooter>
        </>
      )}
    </>
  );
}
