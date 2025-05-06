import { Layout, LayoutTitle } from "@/components/layout";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default function RoutePage() {
  return (
    <Layout>
      <LayoutTitle>Tu es maintenant un utilisateur premium</LayoutTitle>
      <div className="flex gap-4">
        <Link
          className={buttonVariants({ size: "lg", variant: "secondary" })}
          href="/annonces"
        >
          Voir les annonces
        </Link>
        <Link className={buttonVariants({ size: "lg" })} href="/annonces/new">
          Créez ton prochain produit
        </Link>
      </div>
    </Layout>
  );
}
