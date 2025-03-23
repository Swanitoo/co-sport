export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // chemin vers l'icône
  requirements: {
    totalActivities?: number; // nombre total d'activités
    elevation?: number; // dénivelé cumulé en mètres
    distance?: number; // distance cumulée en kilomètres
    sports?: string[]; // types de sports pratiqués
    runningPace?: number; // allure de course en secondes par km
    longRunDistance?: number; // distance minimale pour une course en mètres
  };
}

export interface UserBadge {
  badgeId: string;
  completedAt: Date;
}
