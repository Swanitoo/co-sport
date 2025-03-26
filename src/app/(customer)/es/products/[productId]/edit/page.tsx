// Versión española de la página de edición de actividades (para internacionalización)
// Esta página es simplemente un punto de entrada que redirige a la página principal

import { redirect } from "next/navigation";

interface PageParams {
  productId: string;
}

export default async function SpanishEditProductPage(props: {
  params: Promise<PageParams>;
}): Promise<null> {
  const { productId } = await props.params;
  redirect(`/products/${productId}/edit`);
  return null;
}
