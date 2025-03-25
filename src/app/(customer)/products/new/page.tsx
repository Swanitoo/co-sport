import { requiredCurrentUser } from "@/auth/current-user";
import { Layout, LayoutTitle } from "@/components/layout";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { ProductForm } from "../[slug]/edit/ProductForm";

export default async function RoutePage() {
  const user = await requiredCurrentUser();

  return (
    <Layout>
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/home" className="hover:text-foreground">
          <Home className="size-4" />
        </Link>
        <ChevronRight className="size-4" />
        <Link href="/products" className="hover:text-foreground">
          Annonces
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground">Créer une annonce</span>
      </div>
      <LayoutTitle>Créer une annonce</LayoutTitle>
      <ProductForm userSex={user.sex ?? undefined} />
    </Layout>
  );
}
