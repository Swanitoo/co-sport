// English version of the product edit page (for internationalization)
// This page is simply an entry point that redirects to the main page

import { Metadata } from "next";
import { redirect } from "next/navigation";

interface PageParams {
  productId: string;
}

export const metadata: Metadata = {
  title: "Edit Product",
  description: "Edit your product details",
};

export default async function Page(props: {
  params: Promise<PageParams>;
}): Promise<null> {
  const { productId } = await props.params;
  redirect(`/annonces/${productId}/edit`);
  return null;
}
