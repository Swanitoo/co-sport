"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRIES } from "@/data/country";
import { cn } from "@/lib/utils";
import {
  LEVEL_CLASSES,
  SPORT_CLASSES,
} from "../[productId]/edit/product.schema";
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
  const updateFilters = (newFilters: Partial<FilterType>) => {
    onFilterChange({ ...filters, ...newFilters });
  };

  const handleCountryChange = (countryCode: string) => {
    const newSelectedCountries = filters.countries.includes(countryCode)
      ? filters.countries.filter((code) => code !== countryCode)
      : [...filters.countries, countryCode];
    updateFilters({ countries: newSelectedCountries });
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
        <h3 className="font-medium">Sport</h3>
        <Select
          value={filters.sport || ""}
          onValueChange={(value) => updateFilters({ sport: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un sport" />
          </SelectTrigger>
          <SelectContent>
            {SPORT_CLASSES.map((sport) => (
              <SelectItem key={sport} value={sport}>
                {sport}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Lieu</h3>
        <Select
          value={filters.venue || ""}
          onValueChange={(value) => updateFilters({ venue: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez un lieu" />
          </SelectTrigger>
          <SelectContent>
            {venues?.map((venue, index) => {
              const displayName = venue.venueName || venue.venueAddress;
              if (!displayName) return null;
              return (
                <SelectItem key={index} value={displayName}>
                  {displayName}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Niveau</h3>
        <Select
          value={filters.level || ""}
          onValueChange={(value) => updateFilters({ level: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un niveau" />
          </SelectTrigger>
          <SelectContent>
            {LEVEL_CLASSES.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Affinités culturelles du partenaire</h3>
        <Select value="" onValueChange={(value) => handleCountryChange(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez des pays" />
          </SelectTrigger>
          <SelectContent>
            {countryOptions.map((country) => (
              <SelectItem key={country.value} value={country.value}>
                {country.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          👩 Only Girls
        </Button>
      )}
    </div>
  );
}
