import { requieredCurrentUser } from "@/auth/current-user";
import { Layout, LayoutTitle } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/prisma";
import type { PageParams } from "@/types/next";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function RoutePage(
  props: PageParams<{
    productId: string;
  }>
) {
  const user = await requieredCurrentUser();

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
          <CardContent>
            <p>Slug : {product.slug}</p>
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
