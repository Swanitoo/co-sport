import { requiredCurrentUser } from "@/auth/current-user";
import { Layout, LayoutDescription, LayoutTitle } from "@/components/layout";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/prisma";
import type { PageParams } from "@/types/next";
import Link from "next/link";
import { FilteredProductList } from "./list/FilteredProductList";
import { getUniqueVenues } from "./list/productList.actions";

export default async function RoutePage(props: PageParams<{ page?: string }>) {
  const user = await requiredCurrentUser();
  const currentPage = Number(props.searchParams.page) || 1;
  const itemsPerPage = 10;
  const venues = await getUniqueVenues();
  const initialProducts = await prisma.product.findMany({
    where: {
      ...(props.searchParams.sport && {
        sport: props.searchParams.sport as string,
      }),
      ...(props.searchParams.level && {
        level: props.searchParams.level as string,
      }),
      ...(props.searchParams.onlyGirls === "true" && {
        user: {
          sex: "F",
        },
      }),
    },
    include: {
      memberships: {
        where: { userId: user.id },
      },
      user: {
        select: {
          id: true,
          sex: true,
          country: true,
        },
      },
    },
    take: 10,
  });

  return (
    <Layout>
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <div className="space-y-0.5">
          <LayoutTitle>Annonces</LayoutTitle>
          <LayoutDescription>
            Créer ton annonce ou rejoins-en une.
          </LayoutDescription>
        </div>
        <Link
          href="/products/new"
          className={buttonVariants({ variant: "default" })}
        >
          Créer une annonce
        </Link>
      </div>
      <FilteredProductList
        initialProducts={initialProducts}
        userSex={user.sex}
        userId={user.id}
        venues={venues}
      />
    </Layout>
  );
}
