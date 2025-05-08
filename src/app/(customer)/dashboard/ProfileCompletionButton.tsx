"use client";

import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProfileDataCheck } from "./ProfileDataCheck";

interface ProfileCompletionButtonProps {
  user: {
    sex?: string | null;
    country?: string | null;
    email?: string | null;
    stravaConnected?: boolean;
    stravaLinkRefused?: boolean;
  };
  completionPercentage: number;
}

export function ProfileCompletionButton({
  user,
  completionPercentage: initialCompletionPercentage,
}: ProfileCompletionButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(
    initialCompletionPercentage
  );
  const searchParams = useSearchParams();

  // Mettre à jour le pourcentage local lorsque la prop change
  useEffect(() => {
    setCompletionPercentage(initialCompletionPercentage);
  }, [initialCompletionPercentage]);

  // Calculer quelles données sont manquantes
  const needsSex = !user.sex;
  const needsCountry = !user.country;
  const needsEmail = !user.email;
  const shouldAskLinkStrava = !user.stravaConnected && !user.stravaLinkRefused;

  // Calculer si le profil est incomplet
  const isProfileIncomplete =
    needsSex || needsCountry || needsEmail || shouldAskLinkStrava;

  // Vérifier si l'utilisateur arrive de la page d'annonce réservée aux femmes
  const fromOnlyGirls = searchParams.get("fromOnlyGirls") === "true";

  // Vérifier si l'utilisateur vient de se connecter via OAuth (Google ou Strava)
  const openProfileModal = searchParams.get("openProfileModal") === "true";

  // Ouvrir automatiquement la modale si le profil est incomplet et que l'utilisateur arrive d'une annonce réservée aux femmes,
  // ou si le sexe n'est pas spécifié quelle que soit la provenance
  // ou si l'utilisateur vient juste de se connecter via OAuth
  useEffect(() => {
    if (
      (isProfileIncomplete && fromOnlyGirls) ||
      needsSex ||
      openProfileModal
    ) {
      setIsModalOpen(true);
    }
  }, [isProfileIncomplete, fromOnlyGirls, needsSex, openProfileModal]);

  // Fonction pour mettre à jour le pourcentage de complétion
  const handleProgressUpdate = (newProgress: number) => {
    setCompletionPercentage(newProgress);
  };

  // Ne rien afficher si le profil est complet à 100%
  if (completionPercentage >= 100) {
    return null;
  }

  return (
    <>
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Complétion du profil
          </span>
          <span className="text-sm font-medium">{completionPercentage}%</span>
        </div>
        <div className="relative w-full">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-500 ease-in-out"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="mt-2"
          >
            Compléter le profil
          </Button>
        </div>
      </div>

      {/* Modal de complétion de profil */}
      <ProfileDataCheck
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        needsSex={needsSex}
        needsCountry={needsCountry}
        needsEmail={needsEmail}
        shouldAskLinkStrava={shouldAskLinkStrava}
        existingData={{
          sex: user.sex,
          country: user.country,
          email: user.email,
          stravaConnected: user.stravaConnected,
        }}
        completionPercentage={completionPercentage}
        onProgressUpdate={handleProgressUpdate}
      />
    </>
  );
}
