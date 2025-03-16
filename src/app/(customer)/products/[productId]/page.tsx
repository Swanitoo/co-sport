import { currentUser } from "@/auth/current-user";
import { Layout, LayoutTitle } from "@/components/layout";
import { getServerTranslations } from "@/components/server-translation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SocialShareButtons } from "@/components/ui/social-share-buttons";
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
import { Suspense } from "react";
import { AcceptRequestButton } from "./AcceptButton";
import { ChatComponent } from "./Chat";
import { DeleteButton } from "./DeleteButton";
import { DeleteReviewButton } from "./DeleteReviewButton";
import { LEVEL_CLASSES, SPORTS } from "./edit/product.schema";
import { JoinRequestButton } from "./JoinRequestButton";
import { LeaveButton } from "./LeaveButton";
import { ProductLocationMap } from "./ProductLocationMap";
import { RemoveMemberButton } from "./RemoveMemberButton";

// Activation de l'ISR pour cette page
export const dynamic = "force-dynamic"; // Permettre les mises à jour dynamiques des données
export const revalidate = 60; // Revalider toutes les 60 secondes

// Fallback pour le chargement des cartes
function CardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="h-6 w-24 rounded bg-muted"></div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-muted"></div>
          <div className="h-4 w-3/4 rounded bg-muted"></div>
        </div>
      </CardContent>
    </Card>
  );
}

// Fallback pour le chargement du chat
function ChatSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 w-full rounded bg-muted"></div>
      <div className="h-[400px] w-full rounded bg-muted"></div>
    </div>
  );
}

// Fallback pour le chargement de la carte
function MapSkeleton() {
  return (
    <div className="h-[300px] w-full animate-pulse rounded bg-muted"></div>
  );
}

export default async function RoutePage({
  params: { productId },
}: PageParams<{ productId: string }>) {
  // Obtenir les traductions
  const { t, locale } = await getServerTranslations();

  const user = await currentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const getSportIcon = (sportName: string) => {
    const sport = SPORTS.find((s) => s.name === sportName);
    return sport?.icon || "🎯";
  };

  const getLevelIcon = (levelName: string) => {
    const level = LEVEL_CLASSES.find((l) => l.name === levelName);
    return level?.icon || "🎯";
  };

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

  // Définir les variables avant de les utiliser
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
          <Suspense
            fallback={
              <div className="max-w-[90%] space-y-0.5">
                <div className="h-8 w-2/3 rounded bg-muted"></div>
                <div className="h-6 w-1/2 rounded bg-muted"></div>
              </div>
            }
          >
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
          </Suspense>

          <Suspense
            fallback={
              <div className="flex items-center gap-2">
                <div className="h-10 w-24 rounded bg-muted"></div>
              </div>
            }
          >
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
                    prefetch={true}
                  >
                    {t("Products.Actions.Edit", "Modifier")}
                  </Link>
                  <DeleteButton productId={product.id} />
                </>
              )}

              {isClient && !membership && (
                <JoinRequestButton productId={product.id} userId={user.id} />
              )}

              {isClient && membership && membership.status === "PENDING" && (
                <div className="flex items-center gap-2">
                  <button
                    className={buttonVariants({
                      size: "sm",
                      variant: "secondary",
                    })}
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
          </Suspense>
        </div>

        <Suspense
          fallback={
            <div className="flex flex-col text-lg sm:flex-row sm:items-center sm:gap-4">
              <div className="h-8 w-24 rounded bg-muted"></div>
              <span className="hidden text-muted-foreground sm:block">•</span>
              <div className="h-8 w-24 rounded bg-muted"></div>
            </div>
          }
        >
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
        </Suspense>

        <div className="flex gap-4 max-lg:flex-col">
          <Suspense fallback={<CardSkeleton />}>
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>{t("Products.Details", "Détails")}</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Afficher la carte si des coordonnées sont disponibles */}
                {product.venueLat && product.venueLng && (
                  <Suspense fallback={<MapSkeleton />}>
                    <ProductLocationMap product={product} userId={user.id} />
                  </Suspense>
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

                <div className="mt-6 border-t pt-4">
                  <h3 className="mb-3 text-base font-medium">
                    {t("Products.Share", "Partager cette annonce")}
                  </h3>
                  <SocialShareButtons
                    title={product.name}
                    description={
                      product.description || "Découvrez cette activité sportive"
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </Suspense>
          <Suspense fallback={<CardSkeleton />}>
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
                      {/* Bouton de suppression pour les admins */}
                      {user.isAdmin && (
                        <TableHead>
                          {t("Products.Reviews.Actions", "Actions")}
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.reviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell>{review.name}</TableCell>
                        <TableCell>{review.rating}/5</TableCell>
                        <TableCell>{review.text}</TableCell>
                        {/* Bouton de suppression pour les admins */}
                        {user.isAdmin && (
                          <TableCell className="text-right">
                            <DeleteReviewButton reviewId={review.id} />
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {isClient && membership && membership.status === "APPROVED" && (
                  <div className="mt-4">
                    <Link
                      href={`/${locale}/r/${encodeURIComponent(product.slug)}`}
                      className={buttonVariants({
                        size: "sm",
                      })}
                      prefetch={true}
                    >
                      <Link2 size={16} className="mr-2" />
                      {t("Products.WriteReview", "Écrire un avis")}
                    </Link>
                  </div>
                )}
                <div className="mt-2">
                  <Link
                    href={`/${locale}/wall/${encodeURIComponent(product.slug)}`}
                    className={buttonVariants({
                      size: "sm",
                      variant: "outline",
                    })}
                    prefetch={true}
                  >
                    <Link2 size={16} className="mr-2" />
                    {t("Products.SeeAllReviews", "Voir tous les avis")}
                  </Link>
                </div>
              </CardContent>
            </Card>
          </Suspense>
        </div>

        {isOwner && (
          <Suspense fallback={<CardSkeleton />}>
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
          </Suspense>
        )}

        {canViewMessages && (
          <Suspense fallback={<ChatSkeleton />}>
            <ChatComponent
              productId={productId}
              userId={user.id}
              isAdmin={user.isAdmin}
            />
          </Suspense>
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
  const seoDescription = `${
    product.description?.substring(0, 160) || ""
  }... Sport: ${product.sport}, Niveau: ${product.level}`;

  // Base URL pour les URLs absolues
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://co-sport.com";

  return {
    title: `${product.name} | co-sport.com`,
    description: seoDescription,
    openGraph: {
      title: product.name,
      description: seoDescription,
      url: `${baseUrl}/products/${params.productId}`,
      siteName: "Co-Sport",
      images: [
        {
          url: `${baseUrl}/opengraph-image.png`,
          width: 1200,
          height: 630,
          alt: "Co-Sport - Trouver des partenaires d'entraînement",
          type: "image/png",
        },
      ],
      locale: "fr_FR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: seoDescription,
      images: [`${baseUrl}/opengraph-image.png`],
      site: "@co_sport",
    },
    // Compatibilité avec la fonction createSeoMetadata
    ...createSeoMetadata({
      title: `${product.name} | co-sport.com`,
      description: seoDescription,
      path: `/products/${params.productId}`,
    }),
  };
}
