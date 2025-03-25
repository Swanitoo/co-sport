// English version of the product edit page (for internationalization)
// This page is simply an entry point that redirects to the main page

import { PageParams } from "@/types/next";
import EditProductPage from "../../../../products/[slug]/edit/page";

// Fonction de wrapper pour transformer productId en slug
export default function EnglishEditProductPage({
  params,
  searchParams,
}: PageParams<{ productId: string }>) {
  // Transformer le productId en slug et passer les searchParams
  return EditProductPage({
    params: { slug: params.productId },
    searchParams,
  });
}
