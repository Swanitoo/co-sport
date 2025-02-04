"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

function useOutsideClick(callback: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [callback]);

  return ref;
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

  const debouncedQuery = useDebounce(query, 500);
  const wrapperRef = useOutsideClick(() => {
    setVenues([]);
  });
  useEffect(() => {
    const searchVenues = async () => {
      if (debouncedQuery.length < 3) {
        setVenues([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `/api/webhooks/places?q=${encodeURIComponent(debouncedQuery)}`
        );
        if (!response.ok) throw new Error("Search failed");
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

    searchVenues();
  }, [debouncedQuery]);

  return (
    <div ref={wrapperRef} className="relative space-y-2">
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsInvalid(selectedVenue?.name !== e.target.value);
        }}
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
        <ul className="absolute z-50 mt-1 max-h-60 w-full divide-y divide-gray-200 overflow-auto rounded-md border bg-white shadow-lg dark:divide-gray-700 dark:bg-gray-900">
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
              className="relative cursor-pointer select-none px-3 py-2 hover:bg-red-200 hover:text-blue-700 dark:hover:bg-primary/20"
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
          Veuillez sélectionner un lieu dans la liste.
        </p>
      )}
    </div>
  );
}
