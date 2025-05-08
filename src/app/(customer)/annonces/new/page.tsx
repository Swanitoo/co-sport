import { requiredCurrentUser } from "@/auth/current-user";
import { Layout, LayoutTitle } from "@/components/layout";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { ProductForm } from "../[slug]/edit/ProductForm";
import { ProductType } from "../[slug]/edit/product.schema";

export default async function RoutePage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await requiredCurrentUser();
  const searchParams = await props.searchParams;

  // Récupération des paramètres d'URL pour pré-remplir le formulaire
  const sportParam = searchParams.sport as string | undefined;
  const levelParam = searchParams.level as string | undefined;

  // Création d'un objet defaultValues pour le formulaire
  const defaultValues: Partial<ProductType> = {};

  // Ajouter les valeurs si elles sont définies
  if (sportParam) {
    defaultValues.sport = sportParam;
  }

  if (levelParam) {
    defaultValues.level = levelParam;
  }

  return (
    <Layout>
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/home" className="hover:text-foreground">
          <Home className="size-4" />
        </Link>
        <ChevronRight className="size-4" />
        <Link href="/annonces" className="hover:text-foreground">
          Annonces
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground">Créer une annonce</span>
      </div>
      <LayoutTitle>Créer une annonce</LayoutTitle>
      <ProductForm
        userSex={user.sex ?? undefined}
        defaultValues={
          Object.keys(defaultValues).length > 0
            ? (defaultValues as ProductType)
            : undefined
        }
      />
    </Layout>
  );
}
