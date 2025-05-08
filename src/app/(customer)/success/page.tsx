import { Layout, LayoutTitle } from "@/components/layout";
import { buttonVariants } from "@/components/ui/button";
import { generateMetadata as createSeoMetadata } from "@/lib/seo-config";
import { Metadata } from "next";
import Link from "next/link";

// Empêcher l'indexation de la page de paiement réussi
export const generateMetadata = (): Metadata => {
  return createSeoMetadata({
    title: "Paiement réussi",
    description: "Votre paiement a été traité avec succès",
    noindex: true,
  });
};

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
