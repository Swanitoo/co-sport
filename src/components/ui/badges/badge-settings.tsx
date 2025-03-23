"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { updateUserBadgeSettings } from "./badge.actions";

interface BadgeSettingsProps {
  userId: string;
  showBadges: boolean;
  compact?: boolean;
}

export const BadgeSettings = ({
  userId,
  showBadges: initialShowBadges,
  compact = false,
}: BadgeSettingsProps) => {
  const [showBadges, setShowBadges] = useState(initialShowBadges);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setIsUpdating(true);
    setShowBadges(checked);

    try {
      await updateUserBadgeSettings(userId, checked);
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour des paramètres de badge",
        error
      );
      setShowBadges(!checked); // Revenir à l'état précédent en cas d'erreur
    } finally {
      setIsUpdating(false);
    }
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex h-5 items-center justify-center">
              <Switch
                id="show-badges-compact"
                checked={showBadges}
                onCheckedChange={handleToggle}
                disabled={isUpdating}
                className="h-4 w-7"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p className="text-xs">
              En activant cette option, vos badges sportifs seront visibles sur
              votre profil public.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Paramètres d'affichage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Switch
            id="show-badges"
            checked={showBadges}
            onCheckedChange={handleToggle}
            disabled={isUpdating}
          />
          <Label htmlFor="show-badges">
            Afficher mes badges sur mon profil public
          </Label>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          En activant cette option, vos badges sportifs seront visibles sur
          votre profil public. Aucune donnée précise de vos activités Strava ne
          sera partagée.
        </p>
      </CardContent>
    </Card>
  );
};
