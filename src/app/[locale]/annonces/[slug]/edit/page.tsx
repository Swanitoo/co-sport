import { redirect } from "next/navigation";

// Version simplifiée avec redirection
export default async function LocalizedEditProductPage(props: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const params = await props.params;
  // Vérifier que les paramètres sont valides
  if (!params || !params.slug) {
    console.error(
      "[locale]/annonces/[slug]/edit/page.tsx - Erreur: Paramètres invalides:",
      params
    );
    // Rediriger vers la liste des produits si le slug est invalide
    redirect(`/annonces`);
  }

  // Rediriger temporairement vers la version non localisée comme solution de contournement
  redirect(`/annonces/${params.slug}/edit`);
}
