// Versión española de la página de una actividad específica (para internacionalización)
// Esta página es simplemente un punto de entrada que redirige a la página principal

import { redirect } from "next/navigation";

export default async function SpanishProductPage(
  props: {
    params: Promise<{ productId: string }>;
  }
) {
  const params = await props.params;
  // Rediriger vers la page principale
  redirect(`/products/${params.productId}`);
}
