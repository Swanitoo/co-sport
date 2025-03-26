import { redirect } from "next/navigation";

// Version simplifiée avec redirection
export default async function LocalizedEditProductPage(
  props: {
    params: Promise<{ locale: string; slug: string }>;
  }
) {
  const params = await props.params;
  // Vérifier que les paramètres sont valides
  if (!params || !params.slug || typeof params.slug !== "string") {
    console.error(
      "[locale]/products/[slug]/edit/page.tsx - Erreur: Paramètres invalides:",
      params
    );
    // Rediriger vers la liste des produits si le slug est invalide
    redirect(`/products`);
  }

  // Rediriger temporairement vers la version non localisée comme solution de contournement
  redirect(`/products/${params.slug}/edit`);
}
