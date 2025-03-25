// English version of a specific product page (for internationalization)
// This page is simply an entry point that redirects to the main page

import { PageParams } from "@/types/next";
import ProductPage from "../../../products/[slug]/page";

// Fonction de wrapper pour transformer productId en slug
export default function EnglishProductPage({
  params,
  searchParams,
}: PageParams<{ productId: string }>) {
  // Transformer le productId en slug et passer les searchParams
  return ProductPage({
    params: { slug: params.productId },
    searchParams,
  });
}
