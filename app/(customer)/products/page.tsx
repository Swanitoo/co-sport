import { requiredCurrentUser } from "@/auth/current-user";
import { Layout, LayoutDescription, LayoutTitle } from "@/components/layout";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/prisma";
import type { PageParams } from "@/types/next";
import { CheckCircle, Crown, Hourglass } from "lucide-react";
import Link from "next/link";

export default async function RoutePage(props: PageParams<{}>) {
  const user = await requiredCurrentUser();

  const products = await prisma.product.findMany({
    include: {
      memberships: {
        where: { userId: user.id },
      },
      _count: {
        select: {
          reviews: {
            where: {
              text: {
                not: null,
              },
            },
          },
        },
      },
    },
  });

  return (
    <Layout>
      <div className="flex justify-between">
        <div className="space-y-0.5">
          <LayoutTitle>Annonces</LayoutTitle>
          <LayoutDescription>Créer ton annonce ou rejoins-en une.</LayoutDescription>
        </div>

        <Link
          href={`/products/new`}
          className={buttonVariants({ size: "sm", variant: "secondary" })}
        >
          Créer
        </Link>
      </div>
      {products.length ? (
        <Table>
          <TableHeader className="pointer-events-none">
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Sport</TableHead>
              <TableHead>Niveau</TableHead>
              <TableHead>Avis</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} className="cursor-pointer">
                <TableCell>
                  <Link href={`/products/${product.id}`} className="flex items-center">
                    {product.userId === user.id && (
                      <Crown size={16} className="mr-2 flex-shrink-0" />
                    )}
                    {product.memberships.length > 0 ? (
                      product.memberships[0].status === "APPROVED" ? (
                        <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0" />
                      ) : product.memberships[0].status === "PENDING" ? (
                        <Hourglass size={16} className="mr-2 flex-shrink-0" />
                      ) : null
                    ) : null}
                    {product.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={`/products/${product.id}`} className="font-mono">
                    {product.sport}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={`/products/${product.id}`} className="font-mono">
                    {product.level}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={`/products/${product.id}`} className="font-mono">
                    {product._count.reviews}
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Link
          href="/products/new"
          className="flex w-full items-center justify-center rounded-md border-2 border-dashed border-primary p-8 transition-colors hover:bg-accent/40 lg:p-12"
        >
          Créer ton annonce
        </Link>
      )}
    </Layout>
  );
}