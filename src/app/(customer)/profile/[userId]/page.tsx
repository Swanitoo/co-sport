import { Layout, LayoutTitle } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCountryFlag } from "@/data/country";
import { prisma } from "@/prisma";
import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReviewItem } from "../../../(user)/wall/[slug]/ReviewCard";
import { ProfileAvatar } from "./ProfileAvatar";

export default async function ProfilePage({
  params: { userId },
}: {
  params: { userId: string };
}) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      products: {
        include: {
          reviews: {
            where: {
              text: {
                not: null,
              },
              name: {
                not: null,
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const age = user.birthDate
    ? Math.floor(
        (new Date().getTime() - user.birthDate.getTime()) /
          (1000 * 60 * 60 * 24 * 365.25)
      )
    : null;

  // Calculer le nombre total d'avis et la note moyenne
  const allReviews = user.products.flatMap((product) => product.reviews);
  const totalReviews = allReviews.length;
  const averageRating =
    totalReviews > 0
      ? (
          allReviews.reduce((sum, review) => sum + (review.rating || 0), 0) /
          totalReviews
        ).toFixed(1)
      : "0.0";

  const getFirstName = (fullName: string | null): string => {
    if (!fullName) return "";
    return fullName.split(" ")[0];
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="order-2 text-center sm:order-1 sm:text-left">
            <LayoutTitle>{getFirstName(user.name)}</LayoutTitle>
            <p className="text-sm text-muted-foreground">
              Membre depuis{" "}
              {formatDistance(user.createdAt, new Date(), {
                addSuffix: true,
                locale: fr,
              })}
            </p>
          </div>
          <div className="relative order-1 sm:order-2">
            <ProfileAvatar
              image={user.image}
              name={user.name}
              className="size-24 sm:size-32"
            />
            {user.country && (
              <div className="absolute -bottom-2 -left-2 rounded-full bg-background p-1.5 shadow-sm">
                <span className="text-2xl">{getCountryFlag(user.country)}</span>
              </div>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>À propos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.bio && (
              <div>
                <h3 className="mb-2 font-semibold">Bio</h3>
                <p className="text-sm text-muted-foreground">{user.bio}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              {age && (
                <div>
                  <h3 className="mb-1 font-semibold">Âge</h3>
                  <p className="text-sm text-muted-foreground">{age} ans</p>
                </div>
              )}
              {user.sex && (
                <div>
                  <h3 className="mb-1 font-semibold">Genre</h3>
                  <p className="text-sm text-muted-foreground">{user.sex}</p>
                </div>
              )}
              {user.nationality && (
                <div>
                  <h3 className="mb-1 font-semibold">Nationalité</h3>
                  <p className="text-sm text-muted-foreground">
                    {user.nationality}
                  </p>
                </div>
              )}
              {user.city && (
                <div>
                  <h3 className="mb-1 font-semibold">Ville</h3>
                  <p className="text-sm text-muted-foreground">{user.city}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avis reçus ({totalReviews})</CardTitle>
            {totalReviews > 0 && (
              <p className="text-lg font-semibold text-muted-foreground">
                Note moyenne: {averageRating}/5
              </p>
            )}
          </CardHeader>
          <CardContent>
            {totalReviews === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun avis reçu pour le moment
              </p>
            ) : (
              <div className="space-y-4">
                {user.products.map((product) =>
                  product.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b pb-4 last:border-b-0 last:pb-0"
                    >
                      <div className="mb-2">
                        <Link
                          href={`/products/${product.id}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {product.name}
                        </Link>
                      </div>
                      <ReviewItem review={review} />
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Annonces actives ({user.products.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {user.products.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucune annonce active pour le moment
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {user.products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="block transition-transform hover:scale-105"
                  >
                    <Card className="transition-shadow hover:shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-base">
                          {product.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {product.sport} - {product.level}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {product.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
