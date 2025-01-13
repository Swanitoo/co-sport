import { requiredCurrentUser } from "@/auth/current-user";
import { Layout, LayoutDescription, LayoutTitle } from "@/components/layout";
import { buttonVariants } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { prisma } from "@/prisma";
import type { PageParams } from "@/types/next";
import Link from "next/link";
import { FilteredProductList } from "./list/FilteredProductList";

export default async function RoutePage(props: PageParams<{ page?: string }>) {
  const user = await requiredCurrentUser();
  const currentPage = Number(props.searchParams.page) || 1;
  const itemsPerPage = 10;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
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
      },
      skip: (currentPage - 1) * itemsPerPage,
      take: itemsPerPage,
    }),
    prisma.product.count(),
  ]);
  const totalPages = Math.ceil(total / itemsPerPage);

  return (
    <Layout>
      <div className="flex justify-between">
        <div className="space-y-0.5">
          <LayoutTitle>Annonces</LayoutTitle>
          <LayoutDescription>
            Créer ton annonce ou rejoins-en une.
          </LayoutDescription>
        </div>

        <Link
          href={`/products/new`}
          className={buttonVariants({ size: "sm", variant: "secondary" })}
        >
          Créer
        </Link>
      </div>

      {products.length ? (
        <FilteredProductList
          products={products}
          userSex={user.sex}
          userId={user.id}
          users={[user]}
        />
      ) : (
        <Link
          href="/products/new"
          className="flex w-full items-center justify-center rounded-md border-2 border-dashed border-primary p-8 transition-colors hover:bg-accent/40 lg:p-12"
        >
          Créer ton annonce
        </Link>
      )}
      <Pagination className="mt-4">
        <PaginationContent>
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationPrevious href={`?page=${currentPage - 1}`} />
            </PaginationItem>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                href={`?page=${page}`}
                isActive={page === currentPage}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}

          {currentPage < totalPages && (
            <PaginationItem>
              <PaginationNext href={`?page=${currentPage + 1}`} />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </Layout>
  );
}
