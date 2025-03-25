// Version française de la page d'édition d'annonce (pour l'internationalisation)
// Cette page est simplement un point d'entrée qui redirige vers la page principale

import { PageParams } from "@/types/next";
import EditProductPage from "../../../../products/[slug]/edit/page";

// Fonction de wrapper pour transformer productId en slug
export default function FrenchEditProductPage({
  params,
  searchParams,
}: PageParams<{ productId: string }>) {
  // Transformer le productId en slug et passer les searchParams
  return EditProductPage({
    params: { slug: params.productId },
    searchParams,
  });
}
