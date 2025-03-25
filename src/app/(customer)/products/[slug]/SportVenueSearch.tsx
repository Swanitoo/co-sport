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
  const [isSelectionComplete, setIsSelectionComplete] = useState(
    !!defaultValue
  );
  const [showSuggestions, setShowSuggestions] = useState(false);

  const debouncedQuery = useDebounce(query, 500);
  const wrapperRef = useOutsideClick(() => {
    setShowSuggestions(false);
  });

  // Si nous avons un defaultValue mais pas de selectedVenue, on va chercher ses coordonnées
  // pour reconstituer un objet Venue au chargement initial
  useEffect(() => {
    if (defaultValue && !selectedVenue && !isSelectionComplete) {
      const fetchVenueDetails = async () => {
        try {
          const response = await fetch(
            `/api/webhooks/places?q=${encodeURIComponent(defaultValue)}&limit=1`
          );
          if (response.ok) {
            const results = await response.json();
            if (results && results.length > 0) {
              const venue = {
                name: results[0].name,
                address: results[0].formatted_address,
                lat: results[0].geometry.location.lat,
                lng: results[0].geometry.location.lng,
                type: "venue",
              };
              setSelectedVenue(venue);
              setIsSelectionComplete(true);
            }
          }
        } catch (error) {
          console.error("Error fetching venue details:", error);
        }
      };

      fetchVenueDetails();
    }
  }, [defaultValue, selectedVenue, isSelectionComplete]);

  useEffect(() => {
    const searchVenues = async () => {
      if (debouncedQuery.length < 3 || isSelectionComplete) {
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

        // Afficher les suggestions uniquement si la requête est > 2 caractères
        // et que nous ne sommes pas en mode sélection complète
        if (debouncedQuery.length > 2 && !isSelectionComplete) {
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error("Search error:", error);
        setVenues([]);
      } finally {
        setLoading(false);
      }
    };

    searchVenues();
  }, [debouncedQuery, isSelectionComplete]);

  const handleReset = () => {
    setQuery("");
    setSelectedVenue(null);
    setIsSelectionComplete(false);
    setIsInvalid(false);
    setShowSuggestions(false);
  };

  return (
    <div ref={wrapperRef} className="relative space-y-2">
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => {
            const newValue = e.target.value;
            setQuery(newValue);

            // Si l'utilisateur modifie la valeur, on considère que la sélection n'est plus valide
            if (selectedVenue?.name !== newValue) {
              setIsSelectionComplete(false);
              setIsInvalid(true);

              // Afficher les suggestions uniquement si la requête est > 2 caractères
              if (newValue.length > 2) {
                setShowSuggestions(true);
              } else {
                setShowSuggestions(false);
              }
            }
          }}
          onClick={() => {
            // Afficher les suggestions au clic si la requête est > 2 caractères
            // et que nous ne sommes pas en mode sélection complète
            if (query.length > 2 && !isSelectionComplete && venues.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder="Rechercher un lieu (salle de sport, montagne, stade...)"
          className={cn(
            "w-full",
            isInvalid && "border-red-500 focus-visible:ring-red-500"
          )}
          // Empêcher la réinitialisation lors de la perte de focus
          onBlur={() => {
            // Si nous sommes en état de sélection complète, on maintient la valeur
            if (selectedVenue && !isSelectionComplete) {
              setQuery(selectedVenue.name);
              setIsInvalid(false);
            }

            // Ne pas fermer immédiatement pour permettre les clics sur les suggestions
            setTimeout(() => {
              if (document.activeElement !== wrapperRef.current) {
                setShowSuggestions(false);
              }
            }, 200);
          }}
        />

        {isSelectionComplete && query && (
          <button
            type="button"
            onClick={handleReset}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
          >
            <span className="sr-only">Effacer la sélection</span>
            <svg
              className="size-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {loading && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {venues.length > 0 && showSuggestions && !isSelectionComplete && (
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
                setIsSelectionComplete(true);
                setShowSuggestions(false); // Fermer explicitement les suggestions
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
