// English version of a specific product page (for internationalization)
// This page is simply an entry point that redirects to the main page

import { redirect } from "next/navigation";

interface PageParams {
  productId: string;
}

export default async function EnglishProductPage(props: {
  params: Promise<PageParams>;
}): Promise<null> {
  const { productId } = await props.params;
  redirect(`/annonces/${productId}`);
  return null;
}
