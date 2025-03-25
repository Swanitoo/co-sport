// Versión española de la página de edición de actividades (para internacionalización)
// Esta página es simplemente un punto de entrada que redirige a la página principal

import { PageParams } from "@/types/next";
import EditProductPage from "../../../../products/[slug]/edit/page";

// Fonction de wrapper pour transformer productId en slug
export default function SpanishEditProductPage({
  params,
  searchParams,
}: PageParams<{ productId: string }>) {
  // Transformer le productId en slug et passer les searchParams
  return EditProductPage({
    params: { slug: params.productId },
    searchParams,
  });
}
