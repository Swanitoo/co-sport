// Version française de la page d'une annonce spécifique (pour l'internationalisation)
// Cette page est simplement un point d'entrée qui redirige vers la page principale

import { redirect } from "next/navigation";

export default async function FrenchProductPage(
  props: {
    params: Promise<{ productId: string }>;
  }
) {
  const params = await props.params;
  // Rediriger vers la page principale
  redirect(`/products/${params.productId}`);
}
