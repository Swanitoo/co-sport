// Versión española de la página de una actividad específica (para internacionalización)
// Esta página es simplemente un punto de entrada que redirige a la página principal

import { PageParams } from "@/types/next";
import ProductPage from "../../../products/[slug]/page";

// Fonction de wrapper pour transformer productId en slug
export default function SpanishProductPage({
  params,
  searchParams,
}: PageParams<{ productId: string }>) {
  // Transformer le productId en slug et passer les searchParams
  return ProductPage({
    params: { slug: params.productId },
    searchParams,
  });
}
