import type { PageParams } from "@/types/next";
import { Layout, LayoutTitle } from "@/components/layout";
import { requieredCurrentUser } from "@/auth/current-user";
import { prisma } from "@/prisma";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default async function RoutePage(props: PageParams<{}>) {
    const user = await requieredCurrentUser();

    const products = await prisma.product.findMany({
        where: {
            userId: user.id
        },
        select: {
            id: true,
            name: true,
            slug: true,
            _count: {
                select: {
                    reviews: true,
                },
            },
        },
    });

  return (
    <Layout>
        <div className="flex justify-between">
            <LayoutTitle>Products</LayoutTitle>
            <Link
                href={`/products/new`}
                className={buttonVariants({ size: "sm", variant: "secondary" })}
                >
                Create
            </Link>
        </div>
        <Card className="p-4">
            {products.length ? (
            <Table>
                <TableHeader>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Review</TableHead>
                </TableHeader>
                <TableBody>
                    {products.map((product) => (
                        <TableRow key={product.id}>
                            <Link href={`/products/${product.id}`} key={product.id}>
                                <TableCell>{product.name}</TableCell>
                            </Link>
                            <TableCell className="font-mono">{product.slug}</TableCell>
                            <TableCell className="font-mono">{product._count.reviews}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            ) : (
                <Link href="/products/new" 
                className="border-2 flex items-center justify-center transition-colors hover:bg-accent/40 border-dashed border-primary p-8 lg:p-12 w-full rounded-md">
                    Create product
                </Link>
            )}
        </Card>
    </Layout>
  );
}
