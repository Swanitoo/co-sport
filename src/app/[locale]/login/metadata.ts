import { generateMetadata as createSeoMetadata } from "@/lib/seo-config";
import { Metadata } from "next";

// Empêcher l'indexation de la page de connexion
export function generateMetadata(): Metadata {
  return createSeoMetadata({
    title: "Connexion",
    description: "Connectez-vous à votre compte co-sport",
    noindex: true,
  });
}
