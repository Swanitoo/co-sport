"use client";

import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useState } from "react";

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

  const searchVenues = async (searchQuery: string) => {
    if (searchQuery.length < 3) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/webhooks/openstreet?q=${encodeURIComponent(searchQuery)}`
      );
      const results = await response.json();

      const formattedVenues = results.map((result: any) => ({
        name: result.name || result.display_name,
        address: result.display_name,
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        type: result.type,
      }));

      setVenues(formattedVenues);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative space-y-2">
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          searchVenues(e.target.value);
        }}
        placeholder="Rechercher une salle de sport, un stade..."
        className="w-full"
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
                setQuery(venue.name);
                setVenues([]);
              }}
              className="relative cursor-pointer select-none px-3 py-2 transition-colors duration-200 hover:bg-red-200  hover:text-blue-700 dark:hover:bg-primary/20"
            >
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {venue.name}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {venue.address}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
