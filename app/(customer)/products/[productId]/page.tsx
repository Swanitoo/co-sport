import { requiredCurrentUser } from "@/auth/current-user";
import { Layout, LayoutTitle } from "@/components/layout";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/prisma";
import type { PageParams } from "@/types/next";
import { Link2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function RoutePage(
  props: PageParams<{
    productId: string;
  }>
) {
  const user = await requierequiredCurrentUserredCurrentUser();

  const product = await prisma.product.findUnique({
    where: {
      id: props.params.productId,
      userId: user.id,
    },
    include: {
      reviews: {
        where: {
            text: {
                not: null,
            }
        }
      }
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <Layout>
      <LayoutTitle>{product.name}</LayoutTitle>
      <div className="flex gap-4 max-lg:flex-col">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 items-start">
            <p>Slug : {product.slug}</p>
            <Link
              href={`/r/${product.slug}`}
              className={buttonVariants({
                size: "sm",
              })}
            >
              <Link2 size={16} className="mr-2" />
              Share review link
            </Link>
            <Link
              href={`/wall/${product.slug}`}
              className={buttonVariants({
                size: "sm",
              })}
            >
              <Link2 size={16} className="mr-2" />
              Wall link
            </Link>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Text</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {product.reviews.map((review) => (
                  <TableRow key={product.id}>
                    <TableCell>
                        <Link href={`/reviews/${product.id}`} key={product.id}>
                        {product.name}
                        </Link>
                    </TableCell>
                    <TableCell>{review.text}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
