// Importer les composants et fonctions nécessaires
import type { Metadata } from "next";
import { redirect } from "next/navigation";

// Réexporter la fonction generateMetadata mais avec le bon type de paramètres
export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  // Appeler la fonction generateMetadata originale avec le bon paramètre
  const baseFunction = await import("@/app/(customer)/annonces/[slug]/page");
  return baseFunction.generateMetadata({
    params: Promise.resolve({ slug: params.slug }),
  });
}

// Version simplifiée avec redirection
export default async function LocalizedProductPage(props: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const params = await props.params;
  // Vérifier que les paramètres sont valides
  if (!params || !params.slug || !params.locale) {
    console.error(
      "[locale]/annonces/[slug]/page.tsx - Erreur: Paramètres invalides:",
      params
    );
    // Rediriger vers la page d'annonces
    redirect(`/annonces`);
  }

  // Extraire les paramètres
  const { slug, locale } = params;

  // Rediriger vers la page en langue par défaut si la requête vient de l'URL non-localisée
  redirect(`/annonces/${params.slug}`);
}
