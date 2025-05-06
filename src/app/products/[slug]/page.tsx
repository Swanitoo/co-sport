import { redirect } from "next/navigation";

export default async function ProductSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;

  if (!resolvedParams.slug) {
    redirect("/annonces");
  }

  redirect(`/annonces/${resolvedParams.slug}`);
}
