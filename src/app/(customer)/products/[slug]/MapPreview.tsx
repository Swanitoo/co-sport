"use client";

import { useAppTranslations } from "@/components/i18n-provider";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "next-themes";
import { Map, Marker } from "pigeon-maps";

interface MapPreviewProps {
  latitude?: number;
  longitude?: number;
  venueName?: string;
  venueAddress?: string;
  miniVersion?: boolean;
}

export const MapPreview = ({
  latitude = 45.764043, // Lyon par défaut
  longitude = 4.835659, // Lyon par défaut
  venueName = "",
  venueAddress,
  miniVersion = false,
}: MapPreviewProps) => {
  const { t } = useAppTranslations();
  const { theme, systemTheme } = useTheme();

  // Détermine si le thème est sombre
  const isDarkTheme =
    theme === "system" ? systemTheme === "dark" : theme === "dark";

  // Fournisseur de tuiles en fonction du thème
  const getProvider = (x: number, y: number, z: number, dpr?: number) => {
    const s = dpr && dpr >= 2 ? "@2x" : "";
    return isDarkTheme
      ? `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}${s}.png`
          .replace("{s}", "abcd"[Math.floor(Math.random() * 4)])
          .replace("{z}", z.toString())
          .replace("{x}", x.toString())
          .replace("{y}", y.toString())
      : `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}${s}.png`
          .replace("{s}", "abcd"[Math.floor(Math.random() * 4)])
          .replace("{z}", z.toString())
          .replace("{x}", x.toString())
          .replace("{y}", y.toString());
  };

  // Taille du marqueur en fonction du mode (mini ou normal)
  const markerSize = miniVersion ? 30 : 50;
  const defaultZoom = miniVersion ? 13 : 15;

  // Coordonnées pour la carte
  const coords: [number, number] = [latitude, longitude];

  return (
    <div className="size-full">
      <Map
        defaultCenter={coords}
        defaultZoom={defaultZoom}
        provider={getProvider}
        metaWheelZoom={!miniVersion}
        metaWheelZoomWarning={t(
          "Products.Map.ZoomWarning",
          "Utilisez ctrl + molette pour zoomer sur la carte"
        )}
        animate={true}
        attribution={false}
        // Ces propriétés ne sont pas supportées par pigeon-maps, les remplacer par une approche différente
        onClick={miniVersion ? undefined : () => {}}
        zoomSnap={false}
        // Désactiver les interactions si en mode miniature
        {...(miniVersion && {
          className: "pointer-events-none",
        })}
      >
        <Marker width={markerSize} anchor={coords} color="#ef4444" />
      </Map>

      {/* Information sur le lieu - Visible uniquement en mode plein écran */}
      {!miniVersion && (
        <Card className="absolute bottom-4 left-4 z-10 max-w-[80%] bg-background/90 backdrop-blur-sm">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold">{venueName}</h3>
            {venueAddress && (
              <p className="text-sm text-muted-foreground">{venueAddress}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {t("Products.Map.Coordinates", "Coordonnées")}:{" "}
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
