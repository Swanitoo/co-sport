import { requiredCurrentUser } from "@/auth/current-user";
import { Layout, LayoutDescription, LayoutTitle } from "@/components/layout";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { CheckCircle, Crown, Hourglass } from "lucide-react";
import Link from "next/link";
import { ProfileDataCheck } from "../dashboard/ProfileDataCheck";

export default async function RoutePage(props: PageParams<{ page?: string }>) {
  const user = await requiredCurrentUser();

  const currentPage = Number(props.searchParams.page) || 1;
  const itemsPerPage = 10;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
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
      <ProfileDataCheck
        needsSex={user.sex === null}
        needsCountry={!user.country}
      />
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
        <div className="flex flex-col gap-2 space-y-4">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`}>
              <Card className="cursor-pointer flex-col gap-2 transition-all duration-200 ease-in-out hover:scale-[1.02] hover:bg-accent/5  hover:shadow-lg">
                <CardHeader className="flex items-center gap-2 p-4">
                  {product.userId === user.id && (
                    <Crown size={16} className="text-yellow-500" />
                  )}
                  {product.memberships.length > 0 && (
                    <>
                      {product.memberships[0].status === "APPROVED" && (
                        <CheckCircle size={16} className="text-green-500" />
                      )}
                      {product.memberships[0].status === "PENDING" && (
                        <Hourglass size={16} className="text-yellow-500" />
                      )}
                    </>
                  )}
                  <CardTitle>{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <CardDescription className="text-center">
                    {product.sport}
                  </CardDescription>
                </CardContent>
                <CardContent className="p-4 text-center">
                  <p className="font-mono truncate-multiline">
                    {product.description}
                  </p>
                </CardContent>
                <CardContent className="p-4 text-center">
                  <p className="overflow-hidden text-ellipsis font-mono">
                    {product.level}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
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
