"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatDistance,
  formatDuration,
  formatElevation,
  formatPace,
} from "@/lib/format";
import { Activity, Bike } from "lucide-react";
import { useEffect, useState } from "react";

type ActivityStats = {
  totalActivities: number;
  totalDistance: number;
  totalElevation: number;
  totalDuration: number;
  activitiesByType: Record<
    string,
    {
      count: number;
      distance: number;
      elevation: number;
      duration: number;
    }
  >;
};

type StravaStatsProps = {
  userId: string;
};

export const StravaStats = ({ userId }: StravaStatsProps) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}/strava-stats`);

        if (!response.ok) {
          throw new Error("Erreur lors du chargement des statistiques Strava");
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error("Erreur de chargement des stats Strava:", err);
        setError("Impossible de charger les statistiques Strava");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  // Icon mapping for activity types
  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "run":
      case "virtual_run":
        return <Activity className="mr-2 size-5" />;
      case "ride":
      case "virtual_ride":
        return <Bike className="mr-2 size-5" />;
      case "swim":
        return <Activity className="mr-2 size-5" />;
      default:
        return <Activity className="mr-2 size-5" />;
    }
  };

  // French names for activity types
  const getActivityName = (type: string) => {
    switch (type.toLowerCase()) {
      case "run":
      case "virtual_run":
        return "Course à pied";
      case "ride":
      case "virtual_ride":
        return "Cyclisme";
      case "swim":
        return "Natation";
      case "hike":
        return "Randonnée";
      case "walk":
        return "Marche";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 size-5" />
            <Skeleton className="h-6 w-48" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-5 w-28" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-28" />
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
            <Activity className="mr-2 size-5" />
            Statistiques Strava
          </CardTitle>
          <CardDescription>
            {error || "Aucune donnée Strava disponible"}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Sort activity types by distance (descending)
  const sortedActivityTypes = Object.keys(stats.activitiesByType).sort(
    (a, b) => {
      return (
        stats.activitiesByType[b].distance - stats.activitiesByType[a].distance
      );
    }
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="mr-2 size-5" />
          Statistiques Strava
        </CardTitle>
        <CardDescription>
          {stats.totalActivities} activités enregistrées au cours des 12
          derniers mois
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Global stats */}
          <div>
            <h4 className="mb-2 text-sm font-medium">Total</h4>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="secondary"
                className="flex items-center gap-1 text-xs"
              >
                {formatDistance(stats.totalDistance)}
              </Badge>
              <Badge
                variant="secondary"
                className="flex items-center gap-1 text-xs"
              >
                {formatDuration(stats.totalDuration)}
              </Badge>
              <Badge
                variant="secondary"
                className="flex items-center gap-1 text-xs"
              >
                D+ {formatElevation(stats.totalElevation)}
              </Badge>
            </div>
          </div>

          {/* Stats by activity type */}
          {sortedActivityTypes.map((type) => {
            const typeStats = stats.activitiesByType[type];

            // Skip types with very few activities
            if (typeStats.count < 2) return null;

            return (
              <div key={type}>
                <h4 className="mb-2 flex items-center text-sm font-medium">
                  {getActivityIcon(type)}
                  {getActivityName(type)} ({typeStats.count})
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 text-xs"
                  >
                    {formatDistance(typeStats.distance)}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 text-xs"
                  >
                    {formatDuration(typeStats.duration)}
                  </Badge>
                  {typeStats.elevation > 0 && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1 text-xs"
                    >
                      D+ {formatElevation(typeStats.elevation)}
                    </Badge>
                  )}
                  {(type.toLowerCase() === "run" ||
                    type.toLowerCase() === "virtual_run") && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1 text-xs"
                    >
                      {formatPace(typeStats.duration, typeStats.distance)}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
