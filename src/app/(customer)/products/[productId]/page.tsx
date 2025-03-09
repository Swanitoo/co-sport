import { currentUser } from "@/auth/current-user";
import { Layout, LayoutTitle } from "@/components/layout";
import { getServerTranslations } from "@/components/server-translation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCountryFlag } from "@/data/country";
import { generateMetadata as createSeoMetadata } from "@/lib/seo-config";
import { prisma } from "@/prisma";
import type { PageParams } from "@/types/next";
import { CheckCircle, Crown, Link2, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AcceptRequestButton } from "./AcceptButton";
import { ChatComponent } from "./Chat";
import { DeleteButton } from "./DeleteButton";
import { LEVEL_CLASSES, SPORTS } from "./edit/product.schema";
import { JoinRequestButton } from "./JoinRequestButton";
import { LeaveButton } from "./LeaveButton";
import { ProductLocationMap } from "./ProductLocationMap";
import { RemoveMemberButton } from "./RemoveMemberButton";

export default async function RoutePage({
  params: { productId },
}: PageParams<{ productId: string }>) {
  // Obtenir les traductions
  const { t, locale } = await getServerTranslations();

  const user = await currentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      user: {
        select: {
          name: true,
          socialLink: true,
          image: true,
          sex: true,
          country: true,
        },
      },
      reviews: {
        where: {
          text: {
            not: null,
          },
        },
      },
      memberships: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              socialLink: true,
              image: true,
            },
          },
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const isOwner = product.userId === user.id;
  const isClient = product.userId !== user.id;
  const isMember = product.memberships.some(
    (m) => m.userId === user.id && m.status === "APPROVED"
  );
  const canManageProduct = isOwner || user.isAdmin;
  const canViewMessages = isOwner || isMember || user.isAdmin;

  const activeMemberships = product.memberships.filter(
    (m) => m.status === "APPROVED"
  );
  const membership = product.memberships.find((m) => m.userId === user.id);

  const pendingMemberships = product.memberships.filter(
    (m) => m.status === "PENDING"
  );
  const pendingCount = pendingMemberships.length;

  const getSportIcon = (sportName: string) => {
    const sport = SPORTS.find((s) => s.name === sportName);
    return sport?.icon || "🎯";
  };

  const getLevelIcon = (levelName: string) => {
    const level = LEVEL_CLASSES.find((l) => l.name === levelName);
    return level?.icon || "🎯";
  };

  // Marquer les messages comme lus si l'utilisateur est membre ou propriétaire
  if (user) {
    if (isOwner || isMember) {
      // Marquer les messages non lus comme lus
      await prisma.unreadMessage.deleteMany({
        where: {
          userId: user.id,
          message: {
            productId: product.id,
          },
        },
      });

      // Marquer les demandes comme lues
      await prisma.membership.updateMany({
        where: {
          productId: product.id,
          userId: user.id,
          status: "APPROVED",
          read: false,
        },
        data: {
          read: true,
        },
      });
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href={`/${locale}/products`} className="hover:text-foreground">
            {t("Products.Title", "Annonces")}
          </Link>
          <span>/</span>
          <span>{product.name}</span>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          <div className="max-w-[90%] space-y-0.5">
            <LayoutTitle className="break-words">{product.name}</LayoutTitle>
            <div className="flex items-center gap-2">
              <Avatar className="size-6">
                <AvatarImage src={product.user.image || undefined} />
                <AvatarFallback>{product.user.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1">
                {product.user.socialLink ? (
                  <Link
                    href={product.user.socialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer text-sm hover:underline"
                  >
                    {product.user.name}
                  </Link>
                ) : (
                  <Link
                    href={`/${locale}/profile/${product.userId}`}
                    className="cursor-pointer text-sm hover:underline"
                  >
                    {product.user.name}
                  </Link>
                )}
                {product.user.sex && (
                  <span className="text-sm text-muted-foreground">
                    ({product.user.sex})
                  </span>
                )}
                {product.user.country && (
                  <span className="text-base">
                    {getCountryFlag(product.user.country)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canManageProduct && pendingMemberships.length > 0 && (
              <AcceptRequestButton
                membership={pendingMemberships[0]}
                count={pendingCount}
              />
            )}

            {canManageProduct && (
              <>
                {isOwner && <Crown size={16} className="text-yellow-500" />}
                <Link
                  href={`/${locale}/products/${product.id}/edit`}
                  className={buttonVariants({
                    size: "sm",
                    variant: "secondary",
                  })}
                >
                  {t("Products.Actions.Edit", "Modifier")}
                </Link>
                <DeleteButton productId={product.id} />
              </>
            )}
          </div>

          {isClient && !membership && (
            <JoinRequestButton productId={product.id} userId={user.id} />
          )}

          {isClient && membership && membership.status === "PENDING" && (
            <div className="flex items-center gap-2">
              <button
                className={buttonVariants({ size: "sm", variant: "secondary" })}
                disabled
              >
                {t(
                  "Products.Actions.PendingRequest",
                  "En attente d'acceptation..."
                )}
              </button>
            </div>
          )}

          {isClient && membership && membership.status === "APPROVED" && (
            <div className="flex items-center gap-2">
              <span className="flex items-center">
                <CheckCircle size={16} className="mr-2 text-green-600" />
                {t("Products.Actions.YouAreMember", "Tu es membre")}
              </span>
              <LeaveButton productId={product.id} userId={user.id} />
            </div>
          )}

          {isClient && membership && membership.status === "REMOVED" && (
            <div className="flex items-center gap-2">
              <button
                className={buttonVariants({
                  size: "sm",
                  variant: "destructive",
                })}
                disabled
              >
                {t("Products.Actions.RejectedRequest", "Adhésion refusée")}
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col text-lg sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getSportIcon(product.sport)}</span>
            <span>{product.sport}</span>
          </div>
          <span className="hidden text-muted-foreground sm:block">•</span>
          <div className="mt-2 flex items-center gap-2 sm:mt-0">
            <span className="text-2xl">{getLevelIcon(product.level)}</span>
            <span>{product.level}</span>
          </div>
        </div>

        <div className="flex gap-4 max-lg:flex-col">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>{t("Products.Details", "Détails")}</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Afficher la carte si des coordonnées sont disponibles */}
              {product.venueLat && product.venueLng && (
                <ProductLocationMap product={product} userId={user.id} />
              )}

              {product.venueName && (
                <div className="flex items-start gap-2">
                  <MapPin className="mt-1 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{product.venueName}</p>
                    {product.venueAddress &&
                      product.venueAddress !== product.venueName && (
                        <p className="text-sm text-muted-foreground">
                          {product.venueAddress}
                        </p>
                      )}
                  </div>
                </div>
              )}

              <div className="mt-4">
                <p>
                  {t("Products.DescriptionLabel", "Description")} :{" "}
                  {product.description}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>{t("Products.Reviews", "Avis")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader className="pointer-events-none">
                  <TableRow>
                    <TableHead>{t("Products.Form.Name", "Nom")}</TableHead>
                    <TableHead>
                      {t("Products.Reviews.Rating", "Note")}
                    </TableHead>
                    <TableHead>{t("Products.Reviews", "Avis")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {product.reviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell>{review.name}</TableCell>
                      <TableCell>{review.rating}/5</TableCell>
                      <TableCell>{review.text}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {isClient && membership && membership.status === "APPROVED" && (
                <div className="mt-4">
                  <Link
                    href={`/r/${encodeURIComponent(product.slug)}`}
                    className={buttonVariants({
                      size: "sm",
                    })}
                  >
                    <Link2 size={16} className="mr-2" />
                    {t("Products.WriteReview", "Écrire un avis")}
                  </Link>
                </div>
              )}
              <div className="mt-2">
                <Link
                  href={`/wall/${encodeURIComponent(product.slug)}`}
                  className={buttonVariants({
                    size: "sm",
                    variant: "outline",
                  })}
                >
                  <Link2 size={16} className="mr-2" />
                  {t("Products.SeeAllReviews", "Voir tous les avis")}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        {isOwner && (
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>{t("Products.Members", "Membres")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  {activeMemberships.map((membership) => (
                    <TableRow key={membership.id}>
                      <TableCell>
                        <p>{membership.user.name}</p>
                        {membership.user.socialLink && (
                          <Link
                            href={membership.user.socialLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {t(
                              "Products.Members.SocialNetwork",
                              "Réseau social"
                            )}
                          </Link>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <RemoveMemberButton membershipId={membership.id} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
        {canViewMessages && (
          <ChatComponent
            productId={productId}
            userId={user.id}
            isAdmin={user.isAdmin}
          />
        )}
      </div>
    </Layout>
  );
}

// Génération de métadonnées SEO pour la page de détail d'un produit
export async function generateMetadata({
  params,
}: {
  params: { productId: string };
}): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { id: params.productId },
    select: {
      name: true,
      description: true,
      sport: true,
      level: true,
    },
  });

  if (!product) {
    return createSeoMetadata({
      title: "Annonce non trouvée | co-sport.com",
      description: "Cette annonce n'existe pas ou a été supprimée.",
      path: `/products/${params.productId}`,
      noindex: true,
    });
  }

  // Préparer une description optimisée pour le SEO
  const seoDescription = `${product.description.substring(0, 160)}... Sport: ${
    product.sport
  }, Niveau: ${product.level}`;

  return createSeoMetadata({
    title: `${product.name} | co-sport.com`,
    description: seoDescription,
    path: `/products/${params.productId}`,
  });
}
