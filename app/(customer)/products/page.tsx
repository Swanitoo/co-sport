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
import Link from "next/link";

export default async function RoutePage(props: PageParams<{}>) {
  const user = await requiredCurrentUser();

  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      userId: true,
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
          <LayoutTitle>Session</LayoutTitle>
          <LayoutDescription>Créer ta séance ou rejoins-en une.</LayoutDescription>
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
          <TableHeader>
            <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Sport</TableHead>
                <TableHead>Avis</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                <Link href={`/products/${product.id}`} key={product.id}>
                  {product.name}
                </Link>
                </TableCell>
                <TableCell className="font-mono">{product.slug}</TableCell>
                <TableCell className="font-mono">
                  {product._count.reviews}
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
          Créer ta scéance
        </Link>
      )}
    </Layout>
  );
}