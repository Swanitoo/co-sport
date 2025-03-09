"use client";

import { getLocaleFromPathname } from "@/lib/locale-utils";
import { usePathname } from "next/navigation";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// Types pour les différentes sections de traductions
type TranslationsType = {
  Navigation?: Record<string, string>;
  Products?: Record<string, any>;
  Language?: Record<string, string>;
  Theme?: Record<string, string>;
  AppName?: string;
  Common?: Record<string, string>;
  Auth?: Record<string, any>;
  [key: string]: any;
};

// Contexte pour les traductions
const TranslationContext = createContext<{
  translations: TranslationsType;
  locale: string;
  t: (path: string, fallback?: string) => string;
}>({
  translations: {},
  locale: "fr",
  t: (path, fallback = "") => fallback,
});

// Hook pour accéder aux traductions
export function useTranslations() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error(
      "useTranslations must be used within a TranslationProvider"
    );
  }
  return context;
}

// Nous réutilisons getLocaleFromPathname depuis locale-utils.ts
export { getLocaleFromPathname };

// Charger les traductions correspondant à la locale
export async function loadTranslations(locale: string) {
  try {
    if (locale === "fr") {
      return (await import("../../messages/fr.json")).default;
    } else if (locale === "en") {
      return (await import("../../messages/en.json")).default;
    } else if (locale === "es") {
      return (await import("../../messages/es.json")).default;
    }

    // Par défaut, utiliser le français
    return (await import("../../messages/fr.json")).default;
  } catch (error) {
    console.error("Failed to load translations:", error);
    return {};
  }
}

/**
 * Hook pour accéder aux traductions dans les composants client
 * Cette version est compatible avec notre implémentation précédente
 */
export function useAppTranslations() {
  const pathname = usePathname();
  const [translations, setTranslations] = useState<TranslationsType>({});
  const [locale, setLocale] = useState<string>("fr");
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isDebugEnabled, setIsDebugEnabled] = useState<boolean>(false);

  // Effet pour charger les traductions en fonction du pathname
  useEffect(() => {
    // Vérifier si le mode debug est activé
    const debugEnabled =
      typeof window !== "undefined" &&
      localStorage.getItem("translation_debug") === "true";
    setIsDebugEnabled(debugEnabled);

    // Détecter la locale à partir du pathname
    const segments = pathname.split("/").filter(Boolean);
    const pathLocale = ["fr", "en", "es"].includes(segments[0])
      ? segments[0]
      : "fr";
    setLocale(pathLocale);

    // Charger dynamiquement le fichier de traductions
    (async () => {
      try {
        const translationModule = await import(
          `../../messages/${pathLocale}.json`
        );
        setTranslations(translationModule.default);
      } catch (error) {
        console.error(`Failed to load translations for ${pathLocale}:`, error);
        // Fallback sur le français en cas d'erreur
        try {
          const fallbackModule = await import("../../messages/fr.json");
          setTranslations(fallbackModule.default);
        } catch (fallbackError) {
          console.error("Failed to load fallback translations:", fallbackError);
          setTranslations({});
        }
      } finally {
        setIsLoaded(true);
      }
    })();
  }, [pathname]);

  /**
   * Fonction pour accéder aux traductions par chemin (ex: "Products.Title")
   */
  const t = useMemo(() => {
    return (path: string, fallback: string = "") => {
      if (!isLoaded) return fallback;

      try {
        // Accéder aux propriétés imbriquées (ex: "Products.Title" -> translations.Products.Title)
        const parts = path.split(".");
        let result: any = { ...translations };

        for (const part of parts) {
          if (!result || typeof result !== "object") {
            // Traduction manquante - émettre un événement si le debug est activé
            if (isDebugEnabled && typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("missing_translation_key", {
                  detail: { key: path, locale },
                })
              );
            }
            return fallback;
          }
          result = result[part];
        }

        if (typeof result !== "string" || result === "") {
          // Traduction manquante - émettre un événement si le debug est activé
          if (isDebugEnabled && typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("missing_translation_key", {
                detail: { key: path, locale },
              })
            );
          }
          return fallback;
        }

        return result;
      } catch (error) {
        console.error(`Translation error for path "${path}":`, error);

        // Traduction manquante due à une erreur - émettre un événement si le debug est activé
        if (isDebugEnabled && typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("missing_translation_key", {
              detail: { key: path, locale },
            })
          );
        }

        return fallback;
      }
    };
  }, [translations, isLoaded, isDebugEnabled, locale]);

  return {
    t, // Fonction de traduction: t("Products.Title", "Titre par défaut")
    isLoaded, // Si les traductions sont chargées
    locale, // Locale courante (fr, en, es)
    translations, // Objet complet des traductions (pour usage avancé)
  };
}

// Provider pour les traductions
export function TranslationProvider({
  children,
  translations: initialTranslations,
  locale = "fr",
}: {
  children: ReactNode;
  translations: TranslationsType;
  locale?: string;
}) {
  // Fonction de traduction
  const t = (path: string, fallback: string = "") => {
    try {
      const parts = path.split(".");
      let result: any = { ...initialTranslations };

      for (const part of parts) {
        if (!result || typeof result !== "object") return fallback;
        result = result[part];
      }

      return typeof result === "string" ? result : fallback;
    } catch (error) {
      console.error(`Translation error for path "${path}":`, error);
      return fallback;
    }
  };

  const value = useMemo(
    () => ({
      translations: initialTranslations,
      locale,
      t,
    }),
    [initialTranslations, locale]
  );

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}
