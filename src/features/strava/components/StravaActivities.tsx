"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityStats } from "@/features/strava/types";
import { formatPace } from "@/features/strava/utils/activity-utils";
import { BarChart, MapPin, RefreshCw, Ruler } from "lucide-react";
import { useTransition } from "react";
import { syncStravaActivities } from "../services/strava-sync.action";

interface StravaActivityStats {
  type: string;
  count: number;
  totalDistance: number;
  totalElapsedTime: number;
  totalMovingTime: number;
}

interface StravaActivity {
  id: string;
  name: string;
  distance: number;
  movingTime: number;
  elapsedTime: number;
  activityType: string;
  startDate: Date;
  locationCity?: string | null;
  locationCountry?: string | null;
  totalElevationGain?: number | null;
}

interface StravaActivitiesProps {
  stats: StravaActivityStats[] | ActivityStats;
  recentActivities: StravaActivity[];
  isConnected: boolean;
}

export function StravaActivities({
  stats,
  recentActivities,
  isConnected,
}: StravaActivitiesProps) {
  const [isPending, startTransition] = useTransition();

  // Formater la distance en km
  const formatDistanceKm = (meters: number) => {
    return (meters / 1000).toFixed(1) + " km";
  };

  // Formater la durée en heures/minutes
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

  // Déclencher la synchronisation avec Strava
  const handleSync = () => {
    startTransition(async () => {
      await syncStravaActivities();
    });
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activités Strava</CardTitle>
          <CardDescription>
            Connectez votre compte Strava pour voir vos activités
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Liez votre compte Strava dans votre profil pour synchroniser vos
            activités.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className="text-[#FC4C02]"
                fill="currentColor"
              >
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
              </svg>
              Activités Strava
            </CardTitle>
            <CardDescription>
              Vos statistiques et activités récentes
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleSync}
            disabled={isPending}
          >
            <RefreshCw
              className={`size-4 ${isPending ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="recent">
          <TabsList className="mb-4">
            <TabsTrigger value="recent">Récentes</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
          </TabsList>

          <TabsContent value="recent">
            {recentActivities.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground">
                Aucune activité récente
              </p>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex flex-col rounded-lg border p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {getActivityIcon(activity.activityType)}
                        </span>
                        <div>
                          <h4 className="font-medium">{activity.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.startDate).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <p>{translateActivityType(activity.activityType)}</p>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                      <div className="flex flex-col items-center rounded-md bg-muted p-2">
                        <Ruler className="mb-1 size-3" />
                        <span className="font-medium">
                          {formatDistanceKm(activity.distance)}
                        </span>
                        <span className="text-muted-foreground">Distance</span>
                      </div>
                      <div className="flex flex-col items-center rounded-md bg-muted p-2">
                        <BarChart className="mb-1 size-3" />
                        <span className="font-medium">
                          {activity.totalElevationGain
                            ? `${activity.totalElevationGain.toFixed(0)}m`
                            : "-"}
                        </span>
                        <span className="text-muted-foreground">Dénivelé</span>
                      </div>
                      <div className="flex flex-col items-center rounded-md bg-muted p-2">
                        <MapPin className="mb-1 size-3" />
                        <span className="font-medium">
                          {activity.locationCity || "-"}
                        </span>
                        <span className="text-muted-foreground">Lieu</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats">
            {Array.isArray(stats) ? (
              stats.map((stat) => (
                <div key={stat.type} className="rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {getActivityIcon(stat.type)}
                    </span>
                    <h4 className="font-medium">
                      {translateActivityType(stat.type)}
                    </h4>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Activités</p>
                      <p className="text-sm font-medium">{stat.count}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Distance</p>
                      <p className="text-sm font-medium">
                        {formatDistanceKm(stat.totalDistance)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Temps total</p>
                      <p className="text-sm font-medium">
                        {formatTimeHM(stat.totalElapsedTime)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Temps actif</p>
                      <p className="text-sm font-medium">
                        {formatTimeHM(stat.totalMovingTime)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : stats &&
              typeof stats === "object" &&
              "activitiesByType" in stats ? (
              // Traitement pour le format ActivityStats (objet)
              Object.entries(stats.activitiesByType).map(([type, statData]) => (
                <div key={type} className="rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getActivityIcon(type)}</span>
                    <h4 className="font-medium">
                      {translateActivityType(type)}
                    </h4>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Activités</p>
                      <p className="text-sm font-medium">{statData.count}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Distance</p>
                      <p className="text-sm font-medium">
                        {formatDistanceKm(statData.totalDistance)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Temps total</p>
                      <p className="text-sm font-medium">
                        {formatTimeHM(statData.totalDuration)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">
                        {type.toLowerCase().includes("run")
                          ? "Allure"
                          : "Vitesse"}
                      </p>
                      <p className="text-sm font-medium">
                        {type.toLowerCase().includes("run") &&
                        statData.averagePace
                          ? formatPace(statData.averagePace)
                          : statData.averageSpeed
                          ? `${statData.averageSpeed.toFixed(1)} km/h`
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 rounded-lg border p-3">
                <p>Aucune statistique disponible</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
