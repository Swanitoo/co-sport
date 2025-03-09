"use client";

import { useAppTranslations } from "@/components/i18n-provider";

/**
 * Hook pour faciliter la création de liens localisés
 * @returns Une fonction pour créer des liens localisés
 */
export function useLocalizedLink() {
  const { locale } = useAppTranslations();

  /**
   * Crée un lien localisé avec la langue actuelle
   * @param path Chemin relatif sans la langue (ex: "/products")
   * @returns Chemin complet avec la langue (ex: "/fr/products")
   */
  const getLocalizedPath = (path: string): string => {
    // Nettoyer le chemin des éventuels slashes en début
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;

    // Si le chemin est vide, retourner simplement la locale
    if (!cleanPath) return `/${locale}`;

    // Si le chemin contient déjà une langue, le remplacer
    if (/^(fr|en|es)\//.test(cleanPath)) {
      return `/${locale}/${cleanPath.substring(3)}`;
    }

    // Sinon, ajouter la langue au début
    return `/${locale}/${cleanPath}`;
  };

  return { getLocalizedPath };
}
