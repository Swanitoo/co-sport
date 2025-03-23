import { Badge } from "./badge.schemas";

export const BADGES: Badge[] = [
  {
    id: "profil-sportif",
    name: "Profil Sportif",
    description: "Pratique régulière d'activités sportives",
    icon: "/icons/badges/profile.svg",
    requirements: {
      totalActivities: 10,
    },
  },
  {
    id: "montagnard",
    name: "Dénivelé",
    description: "Cumule un dénivelé important dans ses activités",
    icon: "/icons/badges/mountain.svg",
    requirements: {
      elevation: 1000,
    },
  },
  {
    id: "endurant",
    name: "Rapide",
    description:
      "Court à moins de 6 min/km en moyenne sur terrain plat ou moins de 7min30/km avec dénivelé",
    icon: "/icons/badges/speed.svg",
    requirements: {
      runningPace: 360,
    },
  },
  {
    id: "longue-distance",
    name: "Longue Distance",
    description: "A réalisé au moins une course de plus de 15 km",
    icon: "/icons/badges/distance.svg",
    requirements: {
      longRunDistance: 15000, // 15 km en mètres
    },
  },
  {
    id: "multi-sport",
    name: "Multi-sport",
    description: "Pratique plusieurs disciplines sportives",
    icon: "/icons/badges/versatile.svg",
    requirements: {
      sports: ["Run", "Ride", "Swim", "Hike", "TrailRun"],
      totalActivities: 3,
    },
  },
];
