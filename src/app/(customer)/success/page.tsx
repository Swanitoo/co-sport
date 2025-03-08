import { Layout, LayoutTitle } from "@/components/layout";
import { buttonVariants } from "@/components/ui/button";
import type { PageParams } from "@/types/next";
import Link from "next/link";

export default async function RoutePage(props: PageParams<{}>) {
  return (
    <Layout>
      <LayoutTitle>Tu es maintenant un utilisateur premium</LayoutTitle>
      <div className="flex gap-4">
        <Link
          className={buttonVariants({ size: "lg", variant: "secondary" })}
          href="/products"
        >
          Voir les annonces
        </Link>
        <Link className={buttonVariants({ size: "lg" })} href="/products/new">
          Créez ton prochain produit
        </Link>
      </div>
    </Layout>
  );
}
