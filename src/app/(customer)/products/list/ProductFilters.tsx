"use client";

import { useAppTranslations } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { COUNTRIES } from "@/data/country";
import { cn } from "@/lib/utils";
import { LEVEL_CLASSES, SPORTS } from "../[productId]/edit/product.schema";
import {
  SportPerformanceFilters,
  SportPerformanceValues,
} from "./SportPerformanceFilters";
import { FilterType, ProductFiltersProps } from "./productList.schema";

export function ProductFilters({
  onFilterChange,
  filters,
  venues = [],
  className,
  showGenderFilter,
}: ProductFiltersProps & {
  venues: { venueName: string | null; venueAddress: string | null }[];
}) {
  const { t } = useAppTranslations();

  const updateFilters = (newFilters: Partial<FilterType>) => {
    onFilterChange({ ...filters, ...newFilters });
  };

  const handleCountryChange = (countryCode: string) => {
    const newSelectedCountries = filters.countries.includes(countryCode)
      ? filters.countries.filter((code) => code !== countryCode)
      : [...filters.countries, countryCode];
    updateFilters({ countries: newSelectedCountries });
  };

  const handleSportPerformanceChange = (values: SportPerformanceValues) => {
    updateFilters({
      minRunPace: values.minRunPace,
      maxRunPace: values.maxRunPace,
      minCyclingSpeed: values.minCyclingSpeed,
      maxCyclingSpeed: values.maxCyclingSpeed,
      minDistance: values.minDistance,
    });
  };

  const countryOptions = COUNTRIES.map((country) => ({
    value: country.code,
    label: `${country.flag} ${country.name}`,
  }));

  return (
    <div
      className={cn(
        "space-y-6 rounded-lg border border-border bg-card p-6 shadow-sm",
        className
      )}
    >
      <div className="space-y-4">
        <h3 className="font-medium">{t("Products.Filters.Sport", "Sport")}</h3>
        <Select
          value={filters.sport || ""}
          onValueChange={(value) => updateFilters({ sport: value })}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={t(
                "Products.Filters.SelectSport",
                "Sélectionner un sport"
              )}
            />
          </SelectTrigger>
          <SelectContent>
            {SPORTS.map((sport) => (
              <SelectItem key={sport.name} value={sport.name}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{sport.icon}</span>
                  <span>{sport.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">
          {t("Products.Filters.Location", "Lieu")}
        </h3>
        <Select
          value={filters.venue || ""}
          onValueChange={(value) => updateFilters({ venue: value })}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={t(
                "Products.Filters.SelectLocation",
                "Sélectionnez un lieu"
              )}
            />
          </SelectTrigger>
          <SelectContent>
            {venues?.map((venue, index) => {
              const displayName = venue.venueName || venue.venueAddress;
              if (!displayName) return null;
              return (
                <SelectItem key={index} value={displayName}>
                  <span className="block max-w-[200px] truncate">
                    {displayName}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">{t("Products.Filters.Level", "Niveau")}</h3>
        <Select
          value={filters.level || ""}
          onValueChange={(value) => updateFilters({ level: value })}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={t(
                "Products.Filters.SelectLevel",
                "Sélectionner un niveau"
              )}
            />
          </SelectTrigger>
          <SelectContent>
            {LEVEL_CLASSES.map((level) => (
              <SelectItem key={level.name} value={level.name}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{level.icon}</span>
                  <span>{level.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">
          {t(
            "Products.Filters.PartnerCulture",
            "Affinités culturelles du partenaire"
          )}
        </h3>
        <Select value="" onValueChange={(value) => handleCountryChange(value)}>
          <SelectTrigger>
            <SelectValue
              placeholder={t(
                "Products.Filters.SelectCountries",
                "Sélectionnez des pays"
              )}
            />
          </SelectTrigger>
          <SelectContent>
            {countryOptions.map((country) => (
              <SelectItem key={country.value} value={country.value}>
                {country.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Separator />

        <div className="mt-2 flex flex-wrap gap-2">
          {filters.countries.map((countryCode) => {
            const country = COUNTRIES.find((c) => c.code === countryCode);
            if (!country) return null;
            return (
              <span
                key={countryCode}
                className="inline-flex items-center rounded-full bg-gray-200 px-3 py-1 text-gray-700"
              >
                {country.flag} {country.name}
                <button
                  type="button"
                  className="ml-2 text-gray-500 hover:text-gray-700"
                  onClick={() => handleCountryChange(countryCode)}
                >
                  &times;
                </button>
              </span>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Filtres de performance sportive */}
      <SportPerformanceFilters
        onChange={handleSportPerformanceChange}
        defaultValues={{
          minRunPace: filters.minRunPace,
          maxRunPace: filters.maxRunPace,
          minCyclingSpeed: filters.minCyclingSpeed,
          maxCyclingSpeed: filters.maxCyclingSpeed,
          minDistance: filters.minDistance,
        }}
      />

      <Separator />

      {showGenderFilter && (
        <Button
          variant="outline"
          size="lg"
          onClick={() => updateFilters({ onlyGirls: !filters.onlyGirls })}
          className={cn(
            "w-full font-medium border-pink-300 transition-all duration-200",
            filters.onlyGirls
              ? "bg-pink-100 text-pink-900 hover:bg-pink-200 border-pink-500"
              : "text-pink-700 hover:bg-pink-50 hover:text-pink-900 hover:border-pink-500"
          )}
        >
          👩 {t("Products.Filters.OnlyGirls", "Only Girls")}
        </Button>
      )}
    </div>
  );
}
