"use client";

import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPace } from "@/features/strava/utils/activity-utils";
import { useEffect, useState } from "react";

// Valeurs par défaut pour les sliders d'allure de course
const DEFAULT_MIN_RUN_PACE = 210; // 3:30 min/km
const DEFAULT_MAX_RUN_PACE = 600; // 10:00 min/km

// Valeurs par défaut pour les sliders de vitesse à vélo
const DEFAULT_MIN_CYCLING_SPEED = 10; // 10 km/h
const DEFAULT_MAX_CYCLING_SPEED = 35; // 35 km/h

// Valeur par défaut pour la distance
const DEFAULT_MIN_DISTANCE = 5; // 5 km

// Limites pour les sliders
const MIN_RUN_PACE = 180; // 3:00 min/km
const MAX_RUN_PACE = 900; // 15:00 min/km
const MIN_CYCLING_SPEED = 5; // 5 km/h
const MAX_CYCLING_SPEED = 50; // 50 km/h
const MIN_DISTANCE = 1; // 1 km
const MAX_DISTANCE = 100; // 100 km

// Interface pour les valeurs des filtres de performance
export interface SportPerformanceValues {
  minRunPace?: number;
  maxRunPace?: number;
  minCyclingSpeed?: number;
  maxCyclingSpeed?: number;
  minDistance?: number;
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
  // État pour l'onglet actif
  const [activeTab, setActiveTab] = useState("running");

  // Initialiser les valeurs des filtres avec les valeurs par défaut ou les valeurs prédéfinies
  const [filterValues, setFilterValues] = useState<SportPerformanceValues>({
    minRunPace: defaultValues?.minRunPace || DEFAULT_MIN_RUN_PACE,
    maxRunPace: defaultValues?.maxRunPace || DEFAULT_MAX_RUN_PACE,
    minCyclingSpeed:
      defaultValues?.minCyclingSpeed || DEFAULT_MIN_CYCLING_SPEED,
    maxCyclingSpeed:
      defaultValues?.maxCyclingSpeed || DEFAULT_MAX_CYCLING_SPEED,
    minDistance: defaultValues?.minDistance || DEFAULT_MIN_DISTANCE,
  });

  // Mémoriser les valeurs précédentes pour éviter les appels inutiles
  const [previousValues, setPreviousValues] =
    useState<SportPerformanceValues>(filterValues);

  // Déclencher le callback onChange uniquement lorsque les valeurs changent réellement
  useEffect(() => {
    // Comparer les valeurs actuelles avec les valeurs précédentes
    const hasChanged =
      filterValues.minRunPace !== previousValues.minRunPace ||
      filterValues.maxRunPace !== previousValues.maxRunPace ||
      filterValues.minCyclingSpeed !== previousValues.minCyclingSpeed ||
      filterValues.maxCyclingSpeed !== previousValues.maxCyclingSpeed ||
      filterValues.minDistance !== previousValues.minDistance;

    if (hasChanged) {
      // Mettre à jour les valeurs précédentes
      setPreviousValues(filterValues);
      // Déclencher le callback onChange avec les nouvelles valeurs
      onChange(filterValues);
    }
  }, [filterValues, onChange, previousValues]);

  // Fonction pour mettre à jour les valeurs des filtres
  const handleValueChange = (
    key: keyof SportPerformanceValues,
    value: number | number[]
  ) => {
    const newValue = Array.isArray(value) ? value[0] : value;
    setFilterValues((prev) => ({
      ...prev,
      [key]: newValue,
    }));
  };

  // Fonction pour réinitialiser tous les filtres
  const handleReset = () => {
    const resetValues = {
      minRunPace: DEFAULT_MIN_RUN_PACE,
      maxRunPace: DEFAULT_MAX_RUN_PACE,
      minCyclingSpeed: DEFAULT_MIN_CYCLING_SPEED,
      maxCyclingSpeed: DEFAULT_MAX_CYCLING_SPEED,
      minDistance: DEFAULT_MIN_DISTANCE,
    };
    setFilterValues(resetValues);
    setPreviousValues(resetValues);
    if (onReset) onReset();
  };

  return (
    <div className="w-full rounded-lg p-4 shadow-sm">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 grid w-full grid-cols-2">
          <TabsTrigger value="running">Course à pied</TabsTrigger>
          <TabsTrigger value="cycling">Cyclisme</TabsTrigger>
        </TabsList>

        {/* Filtres pour la course à pied */}
        <TabsContent value="running" className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Allure en course à pied
            </label>
            <div className="mb-1 flex justify-between text-xs text-gray-500">
              <span>Rapide</span>
              <span>Lent</span>
            </div>
            <Slider
              min={MIN_RUN_PACE}
              max={MAX_RUN_PACE}
              step={30}
              value={[filterValues.minRunPace!, filterValues.maxRunPace!]}
              onValueChange={(value) => {
                if (value.length === 2) {
                  setFilterValues((prev) => ({
                    ...prev,
                    minRunPace: value[0],
                    maxRunPace: value[1],
                  }));
                }
              }}
              showValues
              showValuePrefix=""
              showValueSuffix=" s/km"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>{formatPace(filterValues.minRunPace)}</span>
              <span>{formatPace(filterValues.maxRunPace)}</span>
            </div>
          </div>
        </TabsContent>

        {/* Filtres pour le cyclisme */}
        <TabsContent value="cycling" className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Vitesse à vélo
            </label>
            <div className="mb-1 flex justify-between text-xs text-gray-500">
              <span>Lent</span>
              <span>Rapide</span>
            </div>
            <Slider
              min={MIN_CYCLING_SPEED}
              max={MAX_CYCLING_SPEED}
              step={1}
              value={[
                filterValues.minCyclingSpeed!,
                filterValues.maxCyclingSpeed!,
              ]}
              onValueChange={(value) => {
                if (value.length === 2) {
                  setFilterValues((prev) => ({
                    ...prev,
                    minCyclingSpeed: value[0],
                    maxCyclingSpeed: value[1],
                  }));
                }
              }}
              showValues
              showValuePrefix=""
              showValueSuffix=" km/h"
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Filtre pour la distance (commun aux deux sports) */}
      <div className="mt-6">
        <label className="mb-2 block text-sm font-medium">
          Distance moyenne minimale
        </label>
        <Slider
          min={MIN_DISTANCE}
          max={MAX_DISTANCE}
          step={1}
          value={[filterValues.minDistance!]}
          onValueChange={(value) => handleValueChange("minDistance", value)}
          showValues
          showValuePrefix=""
          showValueSuffix=" km"
        />
      </div>
    </div>
  );
};

export default SportPerformanceFilters;
