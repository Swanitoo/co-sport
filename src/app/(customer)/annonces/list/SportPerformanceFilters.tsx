"use client";

import { BADGES } from "@/components/ui/badges/badge.config";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StravaConnectDialog } from "@/features/strava/components/StravaConnectDialog";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// Interface pour les valeurs des filtres de performance
export interface SportPerformanceValues {
  requiredBadges?: string[];
}

interface SportPerformanceFiltersProps {
  defaultValues?: SportPerformanceValues;
  onChange: (values: SportPerformanceValues) => void;
  onReset?: () => void;
}

export const SportPerformanceFilters = ({
  defaultValues,
  onChange,
  onReset,
}: SportPerformanceFiltersProps) => {
  const { data: session } = useSession();
  const [showStravaDialog, setShowStravaDialog] = useState(false);
  const initialDefaultValues = useRef(defaultValues);

  // Initialiser les valeurs des filtres avec les valeurs par défaut ou les valeurs prédéfinies
  const [filterValues, setFilterValues] = useState<SportPerformanceValues>({
    requiredBadges: defaultValues?.requiredBadges || [],
  });

  // Vérifier si l'utilisateur est connecté à Strava
  const isStravaConnected = !!session?.user?.stravaConnected;

  // S'assurer que la modification est gérée
  useEffect(() => {
    // Appeler onChange seulement si les valeurs internes ont été modifiées par l'utilisateur
    // et pas en réponse à un changement de defaultValues
    if (
      JSON.stringify(filterValues) !==
      JSON.stringify(initialDefaultValues.current)
    ) {
      onChange(filterValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValues]);

  // Mettre à jour les valeurs si defaultValues change
  useEffect(() => {
    if (
      JSON.stringify(defaultValues) !==
      JSON.stringify(initialDefaultValues.current)
    ) {
      initialDefaultValues.current = defaultValues;
      setFilterValues({
        requiredBadges: defaultValues?.requiredBadges || [],
      });
    }
  }, [defaultValues]);

  // Gérer la fonction onReset
  useEffect(() => {
    // Fonction pour réinitialiser nos filtres internes
    if (onReset) {
      // Utiliser la fonction onReset directement
      onReset();
    }
  }, [onReset]);

  // Gérer la sélection/désélection des badges
  const handleBadgeToggle = (badgeId: string) => {
    setFilterValues((prev) => {
      // Créer une copie du tableau actuel des badges
      const currentBadges = prev.requiredBadges ? [...prev.requiredBadges] : [];

      // Ajouter ou supprimer le badge
      if (currentBadges.includes(badgeId)) {
        return {
          ...prev,
          requiredBadges: currentBadges.filter((id) => id !== badgeId),
        };
      } else {
        return {
          ...prev,
          requiredBadges: [...currentBadges, badgeId],
        };
      }
    });
  };

  // Fonction pour gérer la sélection d'un badge dans le Select
  const handleBadgeSelect = (badgeId: string) => {
    setFilterValues((prev) => ({
      ...prev,
      requiredBadges: [badgeId], // Un seul badge actif à la fois
    }));
  };

  // Calculer si des filtres sont actifs - important pour l'interface parent
  const hasActiveFilters =
    filterValues.requiredBadges && filterValues.requiredBadges.length > 0;

  // Sélectionner le badge actif (le premier s'il y en a plusieurs)
  const activeBadgeId =
    filterValues.requiredBadges && filterValues.requiredBadges.length > 0
      ? filterValues.requiredBadges[0]
      : "";

  return (
    <div
      className="w-full rounded-lg shadow-sm"
      data-has-active-filters={hasActiveFilters ? "true" : "false"}
    >
      {/* Filtre pour les badges - Version Select */}
      <div>
        <div className="mb-3">
          <label className="block text-sm font-medium">
            Badges du créateur
          </label>
        </div>

        <Select value={activeBadgeId} onValueChange={handleBadgeSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un badge" />
          </SelectTrigger>
          <SelectContent>
            {BADGES.map((badge) => (
              <SelectItem key={badge.id} value={badge.id}>
                <div className="flex items-center gap-2">
                  <Image
                    src={badge.icon}
                    alt={badge.name}
                    width={20}
                    height={20}
                  />
                  <span>{badge.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Modale pour inciter à la connexion Strava */}
      <StravaConnectDialog
        openState={[showStravaDialog, setShowStravaDialog]}
      />
    </div>
  );
};

export default SportPerformanceFilters;
