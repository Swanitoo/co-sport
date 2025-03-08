import { currentUser } from "@/auth/current-user";
import { Layout, LayoutTitle } from "@/components/layout";
import { prisma } from "@/prisma";
import { redirect } from "next/navigation";
import { FilteredProductList } from "./list/FilteredProductList";
import { getUniqueVenues } from "./list/productList.actions";

export default async function RoutePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const [initialProducts, venues] = await Promise.all([
    prisma.product.findMany({
      where: {
        AND: [
          // Si c'est un homme, on exclut les annonces onlyGirls
          user.sex === "M" ? { onlyGirls: false } : {},
          // Si c'est une femme et qu'elle veut voir que les annonces de filles
          searchParams?.onlyGirls === "true" && user.sex === "F"
            ? { user: { sex: "F" } }
            : {},
        ],
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      include: {
        memberships: true,
        user: {
          select: {
            id: true,
            sex: true,
            country: true,
            name: true,
            image: true,
          },
        },
      },
    }),
    getUniqueVenues(),
  ]);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <LayoutTitle>Annonces</LayoutTitle>
          <p className="text-muted-foreground">
            Trouve ton partenaire de sport et progressez ensemble !
          </p>
        </div>
        <FilteredProductList
          initialProducts={initialProducts}
          userSex={user.sex}
          userId={user.id}
          venues={venues}
        />
      </div>
    </Layout>
  );
}
