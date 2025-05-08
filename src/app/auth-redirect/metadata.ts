import { generateMetadata as createSeoMetadata } from "@/lib/seo-config";
import type { Metadata } from "next";

/**
 * Métadonnées pour la page de redirection
 * Cette page ne doit pas être indexée par les moteurs de recherche
 */
export function generateMetadata(): Metadata {
  return createSeoMetadata({
    title: "Connexion réussie - CO-Sport",
    description: "Redirection après authentification",
    path: "/auth-redirect",
    noindex: true, // Empêcher l'indexation par les moteurs de recherche
  });
}
