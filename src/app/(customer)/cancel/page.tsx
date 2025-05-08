import { Layout, LayoutTitle } from "@/components/layout";
import { buttonVariants } from "@/components/ui/button";
import { generateMetadata as createSeoMetadata } from "@/lib/seo-config";
import { Metadata } from "next";
import Link from "next/link";

// Empêcher l'indexation de la page d'annulation de paiement
export const generateMetadata = (): Metadata => {
  return createSeoMetadata({
    title: "Paiement annulé",
    description: "Votre paiement a été annulé",
    noindex: true,
  });
};

export default function RoutePage() {
  return (
    <Layout>
      <LayoutTitle>Oh... il semble que le paiement ait été annulé.</LayoutTitle>
      <div className="flex gap-4">
        <Link
          className={buttonVariants({ size: "lg", variant: "secondary" })}
          href="/"
        >
          Retournes a l'accueil
        </Link>
        <Link
          className={buttonVariants({ size: "lg" })}
          href="mailto:swan.marin@gmail.com"
        >
          Contact
        </Link>
      </div>
    </Layout>
  );
}
