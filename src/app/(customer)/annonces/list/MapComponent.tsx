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

// Fonction pour grouper les produits par localisation et sport
const groupProductsByLocationAndSport = (
  products: ProductWithMemberships[]
) => {
  const groups: {
    [key: string]: { [sport: string]: ProductWithMemberships[] };
  } = {};

  products.forEach((product) => {
    if (product.venueLat && product.venueLng) {
      const locationKey = `${product.venueLat.toFixed(
        6
      )},${product.venueLng.toFixed(6)}`;

      if (!groups[locationKey]) {
        groups[locationKey] = {};
      }

      if (!groups[locationKey][product.sport]) {
        groups[locationKey][product.sport] = [];
      }

      groups[locationKey][product.sport].push(product);
    }
  });

  return groups;
};

// Calculer un décalage pour espacer les marqueurs du même endroit
const calculateOffset = (index: number, total: number): [number, number] => {
  if (total <= 1) return [0, 0];

  // Espacement encore plus important (environ 90-100 mètres)
  const radius = 0.001;

  // Distribution en cercle avec angle de départ ajusté pour éviter l'alignement vertical
  const startAngle = Math.PI / 4; // 45 degrés
  const angle = startAngle + (2 * Math.PI * index) / total;
  const x = radius * Math.cos(angle);
  const y = radius * Math.sin(angle);

  return [x, y];
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
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [hoverIndex, setHoverIndex] = useState<string | null>(null);

  // Coordonnées de Lyon comme position par défaut fixe
  const lyonCoords: [number, number] = [45.764043, 4.835659];

  // Initialiser directement avec les coordonnées de Lyon
  const [userLocation, setUserLocation] =
    useState<[number, number]>(lyonCoords);

  // Grouper les produits par localisation
  const productGroups = groupProductsByLocation(products);

  // Grouper les produits par localisation et sport
  const productGroupsByLocationAndSport =
    groupProductsByLocationAndSport(products);

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

  // Réalisons une fonction pour obtenir les produits sélectionnés
  const getSelectedProducts = () => {
    if (!selectedLocation || !selectedSport) return [];

    // Trouver tous les produits à cet emplacement et pour ce sport
    return (
      productGroupsByLocationAndSport[selectedLocation]?.[selectedSport] || []
    );
  };

  // Produits actuellement sélectionnés dans le groupe
  const selectedProducts = getSelectedProducts();
  const selectedProduct = selectedProducts?.[currentProductIndex] || null;

  // Réinitialiser l'index du produit quand on change de localisation ou de sport
  useEffect(() => {
    setCurrentProductIndex(0);
  }, [selectedLocation, selectedSport]);

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
  const markerSize = miniVersion ? 30 : 40;
  const hoverMarkerSize = miniVersion ? 35 : 50;
  const sportMarkerSize = miniVersion ? 40 : 80; // Taille des marqueurs de sport
  const userMarkerSize = miniVersion ? 50 : 100; // Taille du marqueur utilisateur
  const defaultZoom = miniVersion ? (highlightSingleProduct ? 13 : 9) : 12;
  const showUI = !miniVersion; // N'afficher les popups que dans la version complète

  // Style de transition pour les marqueurs
  const markerStyle = {
    cursor: "pointer",
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

  // Créer un keyframe pour l'animation du radar
  const pulseKeyframes = `
    @keyframes pulse {
      0% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(250, 204, 21, 0.7);
      }
      70% {
        transform: scale(1);
        box-shadow: 0 0 0 20px rgba(250, 204, 21, 0);
      }
      100% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(250, 204, 21, 0);
      }
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-6px);
      }
    }
  `;

  return (
    <div
      className={`size-full overflow-hidden ${
        miniVersion ? "" : "rounded-xl border"
      }`}
    >
      <style>{pulseKeyframes}</style>
      <Map
        defaultCenter={getCenter()}
        center={mapCenter}
        defaultZoom={defaultZoom}
        provider={getProvider}
        metaWheelZoom={!miniVersion}
        metaWheelZoomWarning=""
        animate={true}
        attribution={false}
        onClick={(evt) => {
          console.log("CARTE CLIQUÉE");
          showUI && !highlightSingleProduct && setSelectedLocation(null);
          showUI && !highlightSingleProduct && setSelectedSport(null);
        }}
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
            width={userMarkerSize}
            anchor={userLocation}
            color="transparent"
          >
            <div className="relative size-full">
              <div
                className="absolute rounded-full"
                style={{
                  animation: "pulse 2s infinite",
                  boxShadow: "0 0 0 0 rgba(250, 204, 21, 0.7)",
                  background: "rgba(250, 204, 21, 0.3)",
                  border: "2px solid rgba(250, 204, 21, 0.7)",
                  width: "100%",
                  height: "100%",
                  zIndex: 999,
                }}
              />
              <div
                className="absolute inset-0 flex items-center justify-center rounded-full border-4 border-white bg-yellow-400 text-base font-bold text-white"
                style={{
                  width: "70%",
                  height: "70%",
                  top: "15%",
                  left: "15%",
                  zIndex: 1000,
                }}
              >
                Moi
              </div>
            </div>
          </Marker>
        )}

        {/* Afficher les marqueurs pour chaque sport à chaque emplacement */}
        {Object.entries(productGroupsByLocationAndSport).map(
          ([locationKey, sportsAtLocation], locationIndex) => {
            const [lat, lng] = locationKey.split(",").map(Number);
            const sportsList = Object.keys(sportsAtLocation);

            return sportsList.map((sport, sportIndex) => {
              const isSelected =
                selectedLocation === locationKey && selectedSport === sport;
              const productsForSport = sportsAtLocation[sport];

              // Calculer le décalage pour ce sport à cet emplacement
              const [offsetX, offsetY] = calculateOffset(
                sportIndex,
                sportsList.length
              );

              return (
                <Marker
                  key={`${locationKey}-${sport}`}
                  width={sportMarkerSize}
                  anchor={[lat + offsetX, lng + offsetY]}
                  color="transparent"
                  onClick={(evt) => {
                    console.log("MARQUEUR CLIQUÉ:", locationKey, sport);
                    if (!miniVersion) {
                      setSelectedLocation(locationKey);
                      setSelectedSport(sport);
                      setCurrentProductIndex(0);
                    }
                  }}
                >
                  <div
                    className="flex size-full cursor-pointer items-center justify-center"
                    style={{ pointerEvents: "all" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log(
                        "DIV INTÉRIEURE CLIQUÉE:",
                        locationKey,
                        sport
                      );
                      if (!miniVersion) {
                        setSelectedLocation(locationKey);
                        setSelectedSport(sport);
                        setCurrentProductIndex(0);
                      }
                    }}
                  >
                    <div
                      className={`flex items-center justify-center rounded-full transition-transform ${
                        isSelected
                          ? "scale-110 bg-yellow-300"
                          : "bg-amber-500 hover:scale-110"
                      }`}
                      style={{
                        boxShadow: isSelected
                          ? "0 0 0 4px white, 0 6px 10px rgba(0,0,0,0.5)"
                          : "0 0 0 3px white, 0 4px 6px rgba(0,0,0,0.3)",
                        width: "100%",
                        height: "100%",
                        cursor: "pointer",
                        fontSize: "32px",
                        zIndex: isSelected ? 900 : 500,
                        pointerEvents: "all",
                        animation: isSelected
                          ? ""
                          : "bounce 1.5s ease-in-out infinite",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log(
                          "ICÔNE INTÉRIEURE CLIQUÉE:",
                          locationKey,
                          sport
                        );
                        if (!miniVersion) {
                          setSelectedLocation(locationKey);
                          setSelectedSport(sport);
                          setCurrentProductIndex(0);
                        }
                      }}
                    >
                      {/* Afficher l'icône du sport */}
                      {getSportIcon(sport)}

                      {/* Badge indiquant le nombre de produits pour ce sport */}
                      {productsForSport.length > 1 && (
                        <div
                          className="absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-full border-2 border-white bg-red-500 text-xs font-bold text-white"
                          style={{ zIndex: 1000 }}
                        >
                          {productsForSport.length}
                        </div>
                      )}
                    </div>
                  </div>
                </Marker>
              );
            });
          }
        )}

        {selectedLocation &&
          selectedSport &&
          showUI &&
          selectedProducts &&
          selectedProducts.length > 0 && (
            <Overlay
              anchor={[
                selectedProducts[0].venueLat as number,
                selectedProducts[0].venueLng as number,
              ]}
              offset={[120, 260]}
            >
              <div
                className={`max-h-[calc(100vh-4rem)] max-w-[320px] overflow-y-auto rounded-2xl border-2 p-5 shadow-2xl ${
                  isDarkTheme
                    ? "border-gray-800 bg-black text-white"
                    : "border-gray-200 bg-white text-black"
                }`}
                onClick={(e) => e.stopPropagation()}
                style={{ zIndex: 2000 }}
              >
                {/* En-tête avec détails multiples et pagination */}
                {selectedProducts.length > 1 && (
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
                    <AvatarImage
                      src={
                        selectedProducts[currentProductIndex].user.image ||
                        undefined
                      }
                    />
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
                      {getFirstName(
                        selectedProducts[currentProductIndex].user.name || ""
                      )}
                      {selectedProducts[currentProductIndex].user.sex && (
                        <span className="ml-1">
                          ({selectedProducts[currentProductIndex].user.sex})
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Titre et contenu */}
                <Link
                  href={`/${locale}/annonces/${selectedProducts[currentProductIndex].slug}`}
                  target="_blank"
                >
                  <h3
                    className={`mb-2 font-medium hover:underline ${
                      isDarkTheme ? "text-white" : "text-black"
                    }`}
                  >
                    {selectedProducts[currentProductIndex].name}
                  </h3>
                </Link>

                <div className="mb-2 flex flex-wrap gap-1">
                  <Badge
                    variant="outline"
                    className={`flex items-center gap-1 rounded-full ${
                      !isDarkTheme && "border-gray-300 text-black"
                    }`}
                  >
                    <span>
                      {getSportIcon(
                        selectedProducts[currentProductIndex].sport
                      )}
                    </span>
                    {selectedProducts[currentProductIndex].sport}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`flex items-center gap-1 rounded-full ${
                      !isDarkTheme && "border-gray-300 text-black"
                    }`}
                  >
                    <span>
                      {getLevelIcon(
                        selectedProducts[currentProductIndex].level
                      )}
                    </span>
                    {selectedProducts[currentProductIndex].level}
                  </Badge>
                </div>

                {selectedProducts[currentProductIndex].venueName && (
                  <p
                    className={`mb-1 text-sm ${
                      isDarkTheme ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <span className="font-medium">Lieu : </span>
                    {selectedProducts[currentProductIndex].venueName}
                  </p>
                )}

                <p
                  className={`line-clamp-2 text-xs ${
                    isDarkTheme ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {selectedProducts[currentProductIndex].description}
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
                        setSelectedSport(null);
                      }}
                    >
                      Fermer
                    </Button>
                  )}
                  <Link
                    href={`/${locale}/annonces/${selectedProducts[currentProductIndex].slug}`}
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
