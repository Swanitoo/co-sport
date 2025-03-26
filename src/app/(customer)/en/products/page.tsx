// English version of the products page (for internationalization)
// This page is simply an entry point that redirects to the main page

import { redirect } from "next/navigation";

interface SearchParams {
  [key: string]: string | string[] | undefined;
}

export default async function EnglishProductsPage(props: {
  searchParams: Promise<SearchParams>;
}): Promise<null> {
  redirect(`/products`);
  return null;
}
