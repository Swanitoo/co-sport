"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Venue {
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: string;
}

interface SportVenueSearchProps {
  onSelect: (venue: Venue) => void;
  defaultValue?: string;
}

export function SportVenueSearch({
  onSelect,
  defaultValue,
}: SportVenueSearchProps) {
  const [query, setQuery] = useState(defaultValue || "");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [isInvalid, setIsInvalid] = useState(false);

  const searchVenues = async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setVenues([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/webhooks/places?q=${encodeURIComponent(searchQuery)}`
      );
      const results = await response.json();

      const formattedVenues = results.map((result: any) => ({
        name: result.name,
        address: result.formatted_address,
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        type: "venue",
      }));

      setVenues(formattedVenues);
    } catch (error) {
      console.error("Search error:", error);
      setVenues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        searchVenues(query);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsInvalid(selectedVenue?.name !== value);
  };

  return (
    <div className="relative space-y-2">
      <Input
        value={query}
        onChange={handleInputChange}
        placeholder="Rechercher un lieu (salle de sport, montagne, stade...)"
        className={cn(
          "w-full",
          isInvalid && "border-red-500 focus-visible:ring-red-500"
        )}
      />

      {loading && (
        <div className="absolute right-2 top-0">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {venues.length > 0 && (
        <ul className="z-50 mt-1 max-h-60 w-full divide-y divide-gray-200 overflow-auto rounded-md border bg-white shadow-lg dark:divide-gray-700 dark:bg-gray-900">
          {venues.map((venue, index) => (
            <li
              key={index}
              onClick={() => {
                onSelect(venue);
                setSelectedVenue(venue);
                setQuery(venue.name);
                setVenues([]);
                setIsInvalid(false);
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                onSelect(venue);
                setSelectedVenue(venue);
                setQuery(venue.name);
                setVenues([]);
                setIsInvalid(false);
              }}
              className="relative cursor-pointer select-none px-3 py-2 transition-colors duration-200 hover:bg-red-200 hover:text-blue-700 dark:hover:bg-primary/20"
            >
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {venue.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {venue.address}
              </div>
            </li>
          ))}
        </ul>
      )}

      {isInvalid && (
        <p className="text-sm text-red-500">
          Veuillez sélectionner un lieu dans la liste. Si vous ne trouvez pas
          votre lieu exact, cherchez la ville ou l'arrondissement le plus
          proche.
        </p>
      )}
    </div>
  );
}
