"use client";

import { BADGES } from "@/components/ui/badges/badge.config";
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

  // Calculer si des filtres sont actifs - important pour l'interface parent
  const hasActiveFilters =
    filterValues.requiredBadges && filterValues.requiredBadges.length > 0;

  return (
    <div
      className="w-full rounded-lg p-4 shadow-sm"
      data-has-active-filters={hasActiveFilters ? "true" : "false"}
    >
      {/* Filtre pour les badges */}
      <div>
        <div className="mb-3">
          <label className="block text-sm font-medium">
            Badges du créateur
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {BADGES.map((badge) => (
            <div
              key={badge.id}
              onClick={() => handleBadgeToggle(badge.id)}
              className={`flex cursor-pointer items-center rounded border p-2 transition-colors ${
                filterValues.requiredBadges?.includes(badge.id)
                  ? "border-amber-500 bg-amber-100 dark:border-amber-600 dark:bg-amber-900/30"
                  : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
              }`}
              role="checkbox"
              aria-checked={filterValues.requiredBadges?.includes(badge.id)}
              data-filter-active={
                filterValues.requiredBadges?.includes(badge.id)
                  ? "true"
                  : "false"
              }
              data-filter-type="badge"
              data-filter-id={badge.id}
            >
              <div className="relative mr-2 size-6 shrink-0">
                <Image
                  src={badge.icon}
                  alt={badge.name}
                  width={24}
                  height={24}
                />
              </div>
              <span className="truncate text-sm">{badge.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modale pour inciter à la connexion Strava */}
      <StravaConnectDialog
        openState={[showStravaDialog, setShowStravaDialog]}
      />
    </div>
  );
};

export default SportPerformanceFilters;
