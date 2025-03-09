import { getLocaleFromPathname, loadTranslations } from "@/lib/locale-utils";
import { headers } from "next/headers";

/**
 * Charge les traductions côté serveur en fonction de l'URL
 * @returns Un objet avec les traductions et une fonction t()
 */
export async function getServerTranslations() {
  // Récupérer le pathname depuis les headers de la requête
  const headersList = headers();
  const pathname = headersList.get("x-pathname") || "/";

  // Déterminer la locale en utilisant la fonction existante
  const locale = getLocaleFromPathname(pathname);

  // Charger les traductions en utilisant la fonction existante
  const translations = await loadTranslations(locale);

  /**
   * Fonction pour accéder aux traductions (similaire à celle du hook client)
   * @param path Chemin de la traduction (ex: "Products.Title")
   * @param fallback Texte par défaut si la traduction n'existe pas
   */
  const t = (path: string, fallback: string = "") => {
    try {
      // Accéder aux propriétés imbriquées
      const parts = path.split(".");
      let result: any = { ...translations };

      for (const part of parts) {
        if (!result || typeof result !== "object") return fallback;
        result = result[part];
      }

      return typeof result === "string" ? result : fallback;
    } catch (error) {
      console.error(`Server translation error for path "${path}":`, error);
      return fallback;
    }
  };

  return {
    t,
    locale,
    translations,
  };
}
