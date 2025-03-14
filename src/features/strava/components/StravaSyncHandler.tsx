"use client";

import { Loader2 } from "lucide-react";
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
          // Afficher un toast de synchronisation
          const toastId = toast.loading(
            "Synchronisation de vos activités Strava..."
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

          if (data.success) {
            toast.success("Synchronisation Strava réussie", {
              id: toastId,
              description:
                "Vos activités Strava ont été synchronisées avec succès.",
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

    syncStravaActivities();

    // Synchroniser à nouveau si la connexion change
  }, [isConnected, hasTriedSync, isSyncing]);

  // Ce composant ne rend rien visuellement, mais vous pouvez ajouter un indicateur
  // de chargement ou des messages pour informer l'utilisateur
  if (isSyncing) {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-md bg-primary/10 px-4 py-2 text-sm text-primary shadow-md">
        <Loader2 className="size-4 animate-spin" />
        Synchronisation Strava en cours...
      </div>
    );
  }

  return null;
};
