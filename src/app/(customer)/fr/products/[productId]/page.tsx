// Version française de la page d'une annonce spécifique (pour l'internationalisation)
// Cette page est simplement un point d'entrée qui redirige vers la page principale

import { PageParams } from "@/types/next";
import ProductPage from "../../../products/[slug]/page";

// Fonction de wrapper pour transformer productId en slug
export default function FrenchProductPage({
  params,
  searchParams,
}: PageParams<{ productId: string }>) {
  // Log pour déboguer

  // Transformer le productId en slug et passer les searchParams
  return ProductPage({
    params: { slug: params.productId },
    searchParams,
  });
}
