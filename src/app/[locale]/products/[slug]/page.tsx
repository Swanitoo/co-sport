// Importer les composants et fonctions nécessaires
import type { Metadata } from "next";
import { redirect } from "next/navigation";

// Réexporter la fonction generateMetadata mais avec le bon type de paramètres
export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  // Appeler la fonction generateMetadata originale avec le bon paramètre
  const baseFunction = await import("@/app/(customer)/products/[slug]/page");
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
