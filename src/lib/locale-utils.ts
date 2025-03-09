// Imports statiques pour les traductions
import enTranslations from "@/../messages/en.json";
import esTranslations from "@/../messages/es.json";
import frTranslations from "@/../messages/fr.json";

/**
 * Détermine la locale à partir du pathname
 * @param pathname Le chemin de l'URL
 * @returns La locale (fr, en, es) ou fr par défaut
 */
export function getLocaleFromPathname(pathname: string): "fr" | "en" | "es" {
  const segments = pathname.split("/").filter(Boolean);
  const supportedLocales = ["fr", "en", "es"];
  const locale = segments[0];

  return supportedLocales.includes(locale)
    ? (locale as "fr" | "en" | "es")
    : "fr";
}

// Traductions par défaut (pour éviter les erreurs)
const defaultTranslations = {
  AppName: "CoSport",
  Navigation: {
    Home: "Accueil",
    Products: "Annonces",
    Dashboard: "Tableau de bord",
    Profile: "Profil",
    SignIn: "Connexion",
    SignOut: "Déconnexion",
  },
  Products: {
    Title: "Annonces",
    Description: "Trouve ton partenaire de sport et progressez ensemble !",
    Create: "Créer une annonce",
  },
};

/**
 * Charge les traductions correspondant à la locale
 * @param locale La locale à charger
 * @returns Les traductions chargées
 */
export async function loadTranslations(locale: string) {
  // Utiliser une approche avec imports statiques
  try {
    if (locale === "fr") {
      return frTranslations;
    } else if (locale === "en") {
      return enTranslations;
    } else if (locale === "es") {
      return esTranslations;
    }

    // Par défaut, français
    return frTranslations;
  } catch (error) {
    console.error("Failed to load translations:", error);
    return frTranslations;
  }
}
