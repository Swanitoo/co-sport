// Importer les composants et fonctions nécessaires
import type { Metadata } from "next";
import { redirect } from "next/navigation";

// Réexporter la fonction generateMetadata mais avec le bon type de paramètres
export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  // Appeler la fonction generateMetadata originale avec le bon paramètre
  const baseFunction = await import("@/app/(customer)/products/[slug]/page");
  return baseFunction.generateMetadata({ params: { slug: params.slug } });
}

// Version simplifiée avec redirection
export default async function LocalizedProductPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  // Vérifier que les paramètres sont valides
  if (!params || !params.slug || typeof params.slug !== "string") {
    console.error(
      "[locale]/products/[slug]/page.tsx - Erreur: Paramètres invalides:",
      params
    );
    // Rediriger vers la liste des produits si le slug est invalide
    redirect(`/products`);
  }

  // Rediriger temporairement vers la version non localisée comme solution de contournement
  redirect(`/products/${params.slug}`);
}
