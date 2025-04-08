"use client";

import { useAppTranslations } from "@/components/i18n-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getFirstName } from "@/lib/string-utils";
import { ChevronLeft, ChevronRight, Map as MapIcon, User } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Map, Marker, Overlay } from "pigeon-maps";
import { useEffect, useState } from "react";
import { LEVEL_CLASSES, SPORTS } from "../[slug]/edit/product.schema";
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
  const { locale } = useAppTranslations();
  const { theme, systemTheme } = useTheme();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [hoverIndex, setHoverIndex] = useState<string | null>(null);

  // Coordonnées de Lyon comme position par défaut fixe
  const lyonCoords: [number, number] = [45.764043, 4.835659];

  // Initialiser directement avec les coordonnées de Lyon
  const [userLocation, setUserLocation] =
    useState<[number, number]>(lyonCoords);

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

  // Déterminer le centre de la carte
  const getCenter = (): [number, number] => {
    // Pour une annonce unique (vue détaillée), centrer sur sa position
    if (highlightSingleProduct && products.length === 1) {
      const product = products[0];
      return [product.venueLat as number, product.venueLng as number];
    }

    // Pour la liste des annonces, toujours utiliser la position de l'utilisateur si disponible
    if (userLocation && userLocation[0] !== lyonCoords[0]) {
      return userLocation;
    }

    // Fallback sur Lyon
    return lyonCoords;
  };

  // Initialiser le centre de la carte
  const [mapCenter, setMapCenter] = useState<[number, number]>(getCenter());

  // Mettre à jour le centre quand la position utilisateur change
  useEffect(() => {
    if (!highlightSingleProduct) {
      setMapCenter(getCenter());
    }
  }, [userLocation]);

  // Mettre à jour le centre pour le mode détail quand les produits changent
  useEffect(() => {
    if (highlightSingleProduct) {
      setMapCenter(getCenter());
    }
  }, [products]);

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
  const markerSize = miniVersion ? 20 : 30;
  const hoverMarkerSize = miniVersion ? 25 : 40;
  const defaultZoom = miniVersion ? (highlightSingleProduct ? 13 : 9) : 12;
  const showUI = !miniVersion; // N'afficher les popups que dans la version complète

  // Style de transition pour les marqueurs
  const markerStyle = {
    // Suppression de la transition pour une apparence plus stable
  };

  const mobileOptions = {
    touchZoom: true,
    zoomSnap: false,
    mouseEvents: true,
  };

  const singleProductOptions = highlightSingleProduct
    ? {
        touchZoom: !miniVersion, // Activer le zoom tactile sauf en mode miniature
        zoomSnap: false,
        mouseEvents: !miniVersion, // Activer les événements souris sauf en mode miniature
        metaWheelZoom: !miniVersion, // Activer le zoom à la molette sauf en mode miniature
        className: miniVersion ? "pointer-events-none" : "", // Désactiver les interactions uniquement en mode miniature
      }
    : {};

  return (
    <div
      className={`size-full overflow-hidden ${
        miniVersion ? "" : "rounded-xl border"
      }`}
    >
      <Map
        defaultCenter={getCenter()}
        center={mapCenter}
        defaultZoom={defaultZoom}
        provider={getProvider}
        metaWheelZoom={!miniVersion}
        metaWheelZoomWarning=""
        animate={true}
        attribution={false}
        onClick={() =>
          showUI && !highlightSingleProduct && setSelectedLocation(null)
        }
        {...(miniVersion
          ? {
              touchZoom: false,
              zoomSnap: false,
              mouseEvents: false,
              className: "pointer-events-none",
            }
          : mobileOptions)}
        {...singleProductOptions}
      >
        {/* Marqueur de localisation de l'utilisateur - visible uniquement sur la grande carte non détaillée */}
        {userLocation && !miniVersion && !highlightSingleProduct && (
          <Marker
            width={20}
            anchor={userLocation}
            color="#eab308" // Jaune pour la cohérence
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
                color="#eab308"
                style={markerStyle}
                onClick={() => {
                  if (!miniVersion) {
                    setSelectedLocation(locationKey);
                  }
                }}
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
              className={`max-h-[calc(100vh-4rem)] max-w-[280px] overflow-y-auto rounded-2xl border p-4 shadow-lg ${
                isDarkTheme
                  ? "border-gray-800 bg-black text-white"
                  : "border-gray-200 bg-white text-black"
              }`}
              onClick={(e) => e.stopPropagation()}
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
                    {getFirstName(selectedProduct.user.name)}
                    {selectedProduct.user.sex && (
                      <span className="ml-1">({selectedProduct.user.sex})</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Titre et contenu */}
              <Link
                href={`/${locale}/products/${selectedProduct.slug}`}
                target="_blank"
              >
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
                {!highlightSingleProduct && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLocation(null);
                    }}
                  >
                    Fermer
                  </Button>
                )}
                <Link
                  href={`/${locale}/products/${selectedProduct.slug}`}
                  target="_blank"
                >
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
