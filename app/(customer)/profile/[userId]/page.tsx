import { Layout, LayoutTitle } from "@/components/layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/prisma";
import type { Product } from "@prisma/client";
import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { notFound } from "next/navigation";

type UserWithProducts = {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  createdAt: Date;
  birthDate: Date | null;
  nationality: string | null;
  sex: string | null;
  city: string | null;
  bio: string | null;
  country: string | null;
  products: Product[];
};

export default async function ProfilePage({
  params: { userId },
}: {
  params: { userId: string };
}) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      products: {
        where: { enabled: true },
        orderBy: { createdAt: "desc" },
      },
    },
  }) as UserWithProducts | null;

  if (!user) {
    notFound();
  }

  const age = user.birthDate
    ? Math.floor(
        (new Date().getTime() - new Date(user.birthDate).getTime()) /
          (1000 * 60 * 60 * 24 * 365.25)
      )
    : null;

  return (
    <Layout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.image || undefined} />
                <AvatarFallback>
                  {user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <LayoutTitle>{user.name}</LayoutTitle>
                <div className="text-sm text-muted-foreground">
                  Membre depuis{" "}
                  {formatDistance(new Date(user.createdAt), new Date(), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.bio && (
              <div>
                <h3 className="font-semibold mb-2">Bio</h3>
                <p className="text-sm text-muted-foreground">{user.bio}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              {age && (
                <div>
                  <h3 className="font-semibold mb-1">Âge</h3>
                  <p className="text-sm text-muted-foreground">{age} ans</p>
                </div>
              )}
              {user.sex && (
                <div>
                  <h3 className="font-semibold mb-1">Genre</h3>
                  <p className="text-sm text-muted-foreground">{user.sex}</p>
                </div>
              )}
              {user.nationality && (
                <div>
                  <h3 className="font-semibold mb-1">Nationalité</h3>
                  <p className="text-sm text-muted-foreground">
                    {user.nationality}
                  </p>
                </div>
              )}
              {user.city && (
                <div>
                  <h3 className="font-semibold mb-1">Ville</h3>
                  <p className="text-sm text-muted-foreground">{user.city}</p>
                </div>
              )}
            </div>
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
                    className="block"
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">{product.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {product.sport} - {product.level}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2">
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