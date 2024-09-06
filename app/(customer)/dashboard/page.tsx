import { requiredCurrentUser } from "@/auth/current-user";
import { Layout, LayoutTitle } from "@/components/layout";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { prisma } from "@/prisma";
import type { PageParams } from "@/types/next";
import Link from "next/link";
import { ReviewItem } from "../../(user)/wall/[slug]/ReviewCard";

export default async function RoutePage(props: PageParams<{}>) {
  const user = await requiredCurrentUser();

  const productsCount = await prisma.product.count({
    where: {
      userId: user.id,
    },
  });

  const reviewsCount = await prisma.review.count({
    where: {
      product: {
        userId: user.id,
      },
    },
  });

  const lastReview = await prisma.review.findFirst({
    where: {
      product: {
        userId: user.id,
      },
      text: {
        not: null,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <Layout>
      <LayoutTitle>Dashboard</LayoutTitle>
      <h2 className="text-xl font-bold">Content de te voir, {user.name}</h2>
      <div className="flex flex-wrap items-start gap-4">
        <Card className="min-w-52">
          <CardHeader>
            <CardDescription>Séances</CardDescription>
            <CardTitle>{productsCount}</CardTitle>
          </CardHeader>
          <CardHeader>
            <CardDescription>Commentaires</CardDescription>
            <CardTitle>{reviewsCount}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="min-w-52">
          <CardHeader>
            <CardTitle>Dernier commentaire</CardTitle>
          </CardHeader>
          <CardContent className="max-w-lg">
            {lastReview ? (
              <ReviewItem review={lastReview} />
            ) : (
              <p>Pas de commentaire pour le moment</p>
            )}
          </CardContent>
        </Card>
        <Card className="min-w-52">
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Link
              href="/products/new"
              className={buttonVariants({ size: "lg" })}
            >
              Créer une séance
            </Link>
            <Link href="/products" className={buttonVariants({ size: "lg" })}>
              Liste des séance
            </Link>
          </CardContent>
        </Card>
        <Card className="min-w-52">
          <CardHeader>
            <CardTitle>Plan</CardTitle>
            <CardDescription>{user.plan}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p>Max commentaires {user.plan === "FREE" ? 1 : "infini"}</p>
            <Progress value={(reviewsCount * 1) / 1} />
            {productsCount === 1}
            <p>Max séances {user.plan === "FREE" ? 1 : "infini"}</p>
            <Progress value={(productsCount * 1) / 1} />
            {productsCount === 1}
            {user.plan === "FREE" &&
              (productsCount === 1 || reviewsCount === 100) && (
                <Alert>
                  <AlertTitle>
                    You reached the limit of your free plan, please upgrade
                  </AlertTitle>
                  <Link
                    className={buttonVariants({ size: "sm" })}
                    href="/upgrade"
                  >
                    Upgrade
                  </Link>
                </Alert>
              )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}