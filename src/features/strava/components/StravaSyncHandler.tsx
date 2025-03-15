"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface StravaSyncHandlerProps {
  isConnected: boolean | undefined;
}

export const StravaSyncHandler = ({ isConnected }: StravaSyncHandlerProps) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasTriedSync, setHasTriedSync] = useState(false);

  useEffect(() => {
    const syncStravaActivities = async () => {
      if (!isConnected || isSyncing || hasTriedSync) return;

      try {
        setIsSyncing(true);

        // Vérifier si nous venons juste de nous connecter à Strava
        const justConnected = window.location.search.includes("callbackUrl");

        // Si nous venons juste de nous connecter ou c'est la première visite, synchroniser
        if (justConnected || !hasTriedSync) {
          // Afficher un seul toast
          const toastId = toast.loading(
            "Synchronisation de vos activités Strava en cours..."
          );

          const response = await fetch("/api/strava/sync", {
            method: "POST",
          });

          if (!response.ok) {
            const error = await response.text();
            console.error("Erreur de synchronisation Strava:", error);
            toast.error("Échec de synchronisation des activités Strava", {
              id: toastId,
              description: "Veuillez réessayer plus tard.",
            });
            return;
          }

          const data = await response.json();

          // Mise à jour du même toast au lieu d'en créer un nouveau
          if (data.success) {
            toast.success("Synchronisation Strava réussie", {
              id: toastId, // Réutilisation du même ID pour mettre à jour le toast existant
              description:
                "Vos données Strava ont été mises à jour avec succès.",
            });
          } else {
            toast.error("Échec de synchronisation des activités Strava", {
              id: toastId,
              description: data.message || "Veuillez réessayer plus tard.",
            });
          }
        }
      } catch (error) {
        console.error("Erreur lors de la synchronisation Strava:", error);
        toast.error("Erreur de synchronisation Strava", {
          description: "Une erreur s'est produite lors de la synchronisation.",
        });
      } finally {
        setIsSyncing(false);
        setHasTriedSync(true);
      }
    };

    // Délai léger pour éviter la concurrence avec d'autres initialisations
    const timer = setTimeout(() => {
      syncStravaActivities();
    }, 500);

    return () => clearTimeout(timer);
  }, [isConnected, hasTriedSync, isSyncing]);

  return null;
};
