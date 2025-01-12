import { requiredCurrentUser } from "@/auth/current-user";
import { Layout, LayoutTitle } from "@/components/layout";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/prisma";
import type { PageParams } from "@/types/next";
import Link from "next/link";
import { ReviewItem } from "../../(user)/wall/[slug]/ReviewCard";
import { ProfileDataCheck } from "./ProfileDataCheck";

export default async function RoutePage(props: PageParams<{}>) {
  const user = await requiredCurrentUser();

  const productsCount = await prisma.product.count({
    where: {
      userId: user.id,
    },
  });

  const joinedSessionsCount = await prisma.membership.count({
    where: {
      userId: user.id,
      status: "APPROVED",
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
      <LayoutTitle>Tableau de bord</LayoutTitle>
      <ProfileDataCheck
        needsSex={user.sex === null}
        needsCountry={!user.country}
      />
      <h2 className="text-xl font-bold">Content de te voir, {user.name}</h2>
      <div className="flex flex-wrap items-start gap-4">
        <Card className="min-w-52">
          <CardHeader>
            <CardDescription>Annonces</CardDescription>
            <CardTitle>{productsCount}</CardTitle>
          </CardHeader>
          <CardHeader>
            <CardDescription>Annonce Rejoint</CardDescription>
            <CardTitle>{joinedSessionsCount}</CardTitle>
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
              Créer une annonce
            </Link>
            <Link href="/products" className={buttonVariants({ size: "lg" })}>
              Liste des annonces
            </Link>
          </CardContent>
        </Card>
        {/* <Card className="min-w-52">
          <CardHeader>
            <CardTitle>Plan</CardTitle>
            <CardDescription>{user.plan}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
          <p>Annonces Max Rejointes : {user.plan === "FREE" ? `3 (Restantes: ${3 - joinedSessionsCount})` : "illimité"}</p>
          <Progress value={(joinedSessionsCount / (user.plan === "FREE" ? 3 : joinedSessionsCount)) * 100} />

          {user.plan === "FREE" && joinedSessionsCount >= 3 && (
            <p className="text-red-500">Tu as atteint la limite de 3 annonces rejointes pour le plan gratuit. Passes au plan Premium pour rejoindre plus de séances.</p>
          )}
            <p>Annonce Max : {user.plan === "FREE" ? 1 : "illimité"}</p>
            <Progress value={(productsCount * 1) / 1} />
            {productsCount === 1}
            {user.plan === "FREE" &&
              (productsCount === 1 || joinedSessionsCount === 3) && (
                <Alert>
                  <AlertTitle>
                    Tu as atteint la limite de ton forfait gratuit
                  </AlertTitle>
                  <Link
                    className={buttonVariants({ size: "sm" })}
                    href="/upgrade"
                  >
                    Passes au premium
                  </Link>
                </Alert>
              )}
          </CardContent>
        </Card> */}
      </div>
    </Layout>
  );
}
