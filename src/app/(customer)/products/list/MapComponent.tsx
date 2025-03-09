"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Map as MapIcon, User } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Map, Marker, Overlay } from "pigeon-maps";
import { useEffect, useState } from "react";
import { LEVEL_CLASSES, SPORTS } from "../[productId]/edit/product.schema";
import { ProductWithMemberships } from "./productList.schema";

// Types pour notre composant
interface MapComponentProps {
  products: ProductWithMemberships[];
  userId: string;
  miniVersion?: boolean;
  highlightSingleProduct?: boolean;
}

// Fonction pour grouper les produits par localisation
const groupProductsByLocation = (products: ProductWithMemberships[]) => {
  const groups: { [key: string]: ProductWithMemberships[] } = {};

  products.forEach((product) => {
    if (product.venueLat && product.venueLng) {
      const key = `${product.venueLat.toFixed(6)},${product.venueLng.toFixed(
        6
      )}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(product);
    }
  });

  return groups;
};

export const MapComponent = ({
  products,
  userId,
  miniVersion = false,
  highlightSingleProduct = false,
}: MapComponentProps) => {
  const { theme, systemTheme } = useTheme();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [hoverIndex, setHoverIndex] = useState<string | null>(null);

  // Coordonnées de Lyon comme position par défaut fixe
  const lyonCoords: [number, number] = [45.764043, 4.835659];

  // Initialiser directement avec les coordonnées de Lyon
  const [userLocation, setUserLocation] =
    useState<[number, number]>(lyonCoords);
  const [mapCenter, setMapCenter] = useState<[number, number]>(lyonCoords);

  // Grouper les produits par localisation
  const productGroups = groupProductsByLocation(products);

  // Si highlightSingleProduct est true et qu'il n'y a qu'un seul produit, le sélectionner automatiquement
  useEffect(() => {
    if (
      highlightSingleProduct &&
      products.length === 1 &&
      Object.keys(productGroups).length === 1
    ) {
      setSelectedLocation(Object.keys(productGroups)[0]);
    }
  }, [highlightSingleProduct, products.length, productGroups]);

  // Tenter de récupérer une localisation uniquement pour la grande carte
  useEffect(() => {
    // Ne pas exécuter pour la mini-carte
    if (miniVersion) return;

    // Uniquement tenter la géolocalisation pour la grande carte
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          try {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            // Validation basique des coordonnées pour la France et l'Europe
            if (lat > 35 && lat < 60 && lng > -10 && lng < 30) {
              console.log(
                "Géolocalisation navigateur réussie pour la grande carte:",
                lat,
                lng
              );
              setUserLocation([lat, lng]);
              setMapCenter([lat, lng]);
            }
          } catch (error) {
            console.log(
              "Erreur lors du traitement de la géolocalisation:",
              error
            );
          }
        },
        (error) => {
          console.log("Erreur de géolocalisation navigateur:", error);
        },
        {
          timeout: 3000,
          maximumAge: 24 * 60 * 60 * 1000,
        }
      );
    }
  }, [miniVersion]);

  // Produit actuellement sélectionné dans le groupe
  const selectedProducts = selectedLocation
    ? productGroups[selectedLocation]
    : null;
  const selectedProduct = selectedProducts?.[currentProductIndex] || null;

  // Réinitialiser l'index du produit quand on change de localisation
  useEffect(() => {
    setCurrentProductIndex(0);
  }, [selectedLocation]);

  // Détermine si le thème est sombre
  // Si theme est 'system', on utilise systemTheme
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

  // Déterminer le centre de la carte - toujours utiliser Lyon si aucun produit
  const getCenter = () => {
    if (products.length === 0) {
      return lyonCoords; // Lyon par défaut
    }

    // Utiliser le centre des produits
    const lats = products.map((p) => p.venueLat as number);
    const lngs = products.map((p) => p.venueLng as number);

    return [
      lats.reduce((a, b) => a + b, 0) / lats.length,
      lngs.reduce((a, b) => a + b, 0) / lngs.length,
    ];
  };

  // Helper pour obtenir les icônes des sports et niveaux
  const getSportIcon = (sportName: string) => {
    const sport = SPORTS.find((s) => s.name === sportName);
    return sport?.icon || "🎯";
  };

  const getLevelIcon = (levelName: string) => {
    const level = LEVEL_CLASSES.find((l) => l.name === levelName);
    return level?.icon || "🎯";
  };

  // Ajustements pour le mode miniature
  const markerSize = miniVersion ? 20 : 40;
  const hoverMarkerSize = miniVersion ? 25 : 50;
  const defaultZoom = miniVersion ? (highlightSingleProduct ? 13 : 9) : 12;
  const showUI = !miniVersion; // N'afficher les popups que dans la version complète

  // Si c'est une carte pour un seul produit, on veut désactiver certaines interactions
  const singleProductOptions =
    highlightSingleProduct && products.length === 1
      ? {
          metaWheelZoom: false,
          touchZoom: false,
          mouseEvents: miniVersion ? false : true,
          zoomSnap: false,
        }
      : {};

  return (
    <div
      className={`size-full overflow-hidden ${
        miniVersion ? "" : "rounded-xl border"
      }`}
    >
      <Map
        defaultCenter={miniVersion ? lyonCoords : mapCenter}
        defaultZoom={defaultZoom}
        provider={getProvider}
        metaWheelZoom={!miniVersion && !highlightSingleProduct}
        metaWheelZoomWarning="Utilisez ctrl + molette pour zoomer sur la carte"
        animate={true}
        attribution={false}
        onClick={() =>
          showUI && !highlightSingleProduct && setSelectedLocation(null)
        }
        {...(miniVersion && {
          touchZoom: false,
          zoomSnap: false,
          mouseEvents: false,
        })}
        {...singleProductOptions}
      >
        {/* Marqueur de localisation de l'utilisateur - visible uniquement sur la grande carte */}
        {userLocation && !miniVersion && (
          <Marker
            width={20}
            anchor={userLocation}
            color="#10b981" // Vert
          />
        )}

        {/* Afficher un marqueur pour chaque groupe de localisation */}
        {Object.entries(productGroups).map(
          ([locationKey, locationProducts]) => {
            const [lat, lng] = locationKey.split(",").map(Number);
            const isSelected = selectedLocation === locationKey;
            const isHovered = hoverIndex === locationKey;

            // Si c'est une carte pour un seul produit, on met toujours le marqueur en surbrillance
            const forceHighlight =
              highlightSingleProduct && products.length === 1;

            return (
              <Marker
                key={locationKey}
                width={
                  isSelected || isHovered || forceHighlight
                    ? hoverMarkerSize
                    : markerSize
                }
                anchor={[lat, lng]}
                color={isSelected || forceHighlight ? "#ef4444" : "#3b82f6"}
                onClick={() => showUI && setSelectedLocation(locationKey)}
                onMouseOver={() =>
                  showUI && !forceHighlight && setHoverIndex(locationKey)
                }
                onMouseOut={() =>
                  showUI && !forceHighlight && setHoverIndex(null)
                }
              />
            );
          }
        )}

        {selectedProduct && showUI && (
          <Overlay
            anchor={[
              selectedProduct.venueLat as number,
              selectedProduct.venueLng as number,
            ]}
            offset={[120, 240]}
          >
            <div
              className={`max-w-[280px] rounded-2xl border p-4 shadow-lg ${
                isDarkTheme
                  ? "border-gray-800 bg-black text-white"
                  : "border-gray-200 bg-white text-black"
              }`}
            >
              {/* En-tête avec détails multiples et pagination */}
              {selectedProducts && selectedProducts.length > 1 && (
                <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapIcon className="size-3" />
                    {currentProductIndex + 1} / {selectedProducts.length}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentProductIndex((prev) =>
                          prev === 0 ? selectedProducts.length - 1 : prev - 1
                        );
                      }}
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentProductIndex((prev) =>
                          prev === selectedProducts.length - 1 ? 0 : prev + 1
                        );
                      }}
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Infos de l'utilisateur */}
              <div className="mb-3 flex items-center gap-2">
                <Avatar className="size-8 ring-2 ring-background">
                  <AvatarImage src={selectedProduct.user.image || undefined} />
                  <AvatarFallback>
                    <User className="size-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p
                    className={`text-sm font-medium ${
                      isDarkTheme ? "text-white" : "text-black"
                    }`}
                  >
                    {selectedProduct.user.name}
                    {selectedProduct.user.sex && (
                      <span className="ml-1">({selectedProduct.user.sex})</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Titre et contenu */}
              <Link href={`/products/${selectedProduct.id}`} target="_blank">
                <h3
                  className={`mb-2 font-medium hover:underline ${
                    isDarkTheme ? "text-white" : "text-black"
                  }`}
                >
                  {selectedProduct.name}
                </h3>
              </Link>

              <div className="mb-2 flex flex-wrap gap-1">
                <Badge
                  variant="outline"
                  className={`flex items-center gap-1 rounded-full ${
                    !isDarkTheme && "border-gray-300 text-black"
                  }`}
                >
                  <span>{getSportIcon(selectedProduct.sport)}</span>
                  {selectedProduct.sport}
                </Badge>
                <Badge
                  variant="outline"
                  className={`flex items-center gap-1 rounded-full ${
                    !isDarkTheme && "border-gray-300 text-black"
                  }`}
                >
                  <span>{getLevelIcon(selectedProduct.level)}</span>
                  {selectedProduct.level}
                </Badge>
              </div>

              {selectedProduct.venueName && (
                <p
                  className={`mb-1 text-sm ${
                    isDarkTheme ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <span className="font-medium">Lieu : </span>
                  {selectedProduct.venueName}
                </p>
              )}

              <p
                className={`line-clamp-2 text-xs ${
                  isDarkTheme ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {selectedProduct.description}
              </p>

              <div className="mt-3 flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs"
                  onClick={() => setSelectedLocation(null)}
                >
                  Fermer
                </Button>
                <Link href={`/products/${selectedProduct.id}`} target="_blank">
                  <Button size="sm" className="rounded-full text-xs">
                    Voir l'annonce
                  </Button>
                </Link>
              </div>
            </div>
          </Overlay>
        )}
      </Map>
    </div>
  );
};
