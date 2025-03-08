import { Layout, LayoutTitle } from "@/components/layout";
import { buttonVariants } from "@/components/ui/button";
import type { PageParams } from "@/types/next";
import Link from "next/link";

export default async function RoutePage(props: PageParams<{}>) {
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
