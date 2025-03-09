import { currentUser } from "@/auth/current-user";
import { Layout, LayoutTitle } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { prisma } from "@/prisma";
import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FilteredProductList } from "./list/FilteredProductList";
import { getUniqueVenues } from "./list/productList.actions";
import { MiniMap } from "./MiniMap";

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
      select: {
        id: true,
        name: true,
        description: true,
        sport: true,
        level: true,
        userId: true,
        venueName: true,
        venueAddress: true,
        venueLat: true,
        venueLng: true,
        onlyGirls: true,
        createdAt: true,
        updatedAt: true,
        enabled: true,
        slug: true,
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <LayoutTitle>Annonces</LayoutTitle>
              <p className="text-muted-foreground">
                Trouve ton partenaire de sport et progressez ensemble !
              </p>

              <Link href="/products/new" className="mt-4 inline-flex">
                <Button size="lg" className="gap-2">
                  <Plus className="size-4" />
                  Créer une annonce
                </Button>
              </Link>
            </div>

            <div className="mt-4 sm:mt-0">
              <MiniMap
                initialProducts={initialProducts}
                userId={user.id}
                searchParams={searchParams}
              />
            </div>
          </div>
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
