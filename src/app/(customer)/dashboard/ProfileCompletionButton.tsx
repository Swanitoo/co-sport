"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
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
  completionPercentage,
}: ProfileCompletionButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculer quelles données sont manquantes
  const needsSex = !user.sex;
  const needsCountry = !user.country;
  const needsEmail = !user.email;
  const shouldAskLinkStrava = !user.stravaConnected && !user.stravaLinkRefused;

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
      />
    </>
  );
}
