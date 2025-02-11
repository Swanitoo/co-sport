import { currentUser } from "@/auth/current-user";
import { Layout, LayoutTitle } from "@/components/layout";
import { prisma } from "@/prisma";
import { redirect } from "next/navigation";
import { FilteredProductList } from "./list/FilteredProductList";
import { getUniqueVenues } from "./list/productList.actions";

export default async function RoutePage() {
  const user = await currentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const [initialProducts, venues] = await Promise.all([
    prisma.product.findMany({
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
