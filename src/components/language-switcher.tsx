"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { Locale, localeLabels, locales } from "../../locales";

// Version simplifiée ne dépendant pas de next-intl pour l'ancien header
export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  // Déterminer la locale actuelle à partir du pathname
  const currentLocale = useMemo(() => {
    const segments = pathname.split("/");
    return locales.includes(segments[1] as Locale)
      ? (segments[1] as Locale)
      : ("fr" as Locale);
  }, [pathname]);

  const currentFlag = localeLabels[currentLocale]?.flag || "🌐";

  // Fonction pour obtenir le chemin dans la nouvelle langue
  const getPathInLocale = useMemo(() => {
    // Analyser correctement le pathname pour gérer les segments
    const pathSegments = pathname.split("/").filter(Boolean);

    // Vérifier si le premier segment est une locale
    const firstSegmentIsLocale = locales.includes(pathSegments[0] as Locale);

    // Obtenir le chemin sans la locale
    const pathWithoutLocale = firstSegmentIsLocale
      ? pathSegments.slice(1)
      : pathSegments;

    // Si le chemin est vide après avoir retiré la locale, revenir à la racine
    const cleanPath =
      pathWithoutLocale.length > 0 ? `/${pathWithoutLocale.join("/")}` : "/";

    return (locale: Locale) => {
      // Si nous sommes sur la page d'accueil ou une route spéciale
      if (cleanPath === "/" || cleanPath === "/annonces") {
        return locale === "fr" ? cleanPath : `/${locale}${cleanPath}`;
      }

      // Pour les autres routes avec plus de segments
      return locale === "fr" ? cleanPath : `/${locale}${cleanPath}`;
    };
  }, [pathname]);

  // Changer de langue en conservant les paramètres de l'URL actuelle
  const handleLanguageChange = (locale: Locale) => {
    // Obtenir le nouveau chemin avec la bonne locale
    const path = getPathInLocale(locale);

    // Conserver les paramètres de recherche
    const searchParams = new URL(window.location.href).searchParams.toString();
    const fullPath = searchParams ? `${path}?${searchParams}` : path;

    // Rediriger vers la nouvelle URL
    router.push(fullPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative hover:bg-accent"
        >
          <span className="text-xl">{currentFlag}</span>
          <span className="sr-only">Sélectionner la langue</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            className={`flex cursor-pointer items-center gap-2 ${
              locale === currentLocale ? "bg-accent/50" : ""
            }`}
            onClick={() => handleLanguageChange(locale)}
          >
            <span className="text-lg">{localeLabels[locale].flag}</span>
            <span>{localeLabels[locale].name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
