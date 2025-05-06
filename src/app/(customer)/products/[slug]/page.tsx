import { currentUser } from "@/auth/current-user";
import { Layout, LayoutTitle } from "@/components/layout";
import { getServerTranslations } from "@/components/server-translation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
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
import { getFirstName } from "@/lib/string-utils";
import { prisma } from "@/prisma";
import { CheckCircle, Crown, Link2, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AcceptRequestButton } from "./AcceptButton";
import { ChatComponent } from "./Chat";
import { DeleteButton } from "./DeleteButton";
import { DeleteReviewButton } from "./DeleteReviewButton";
import { LEVEL_CLASSES, SPORTS } from "./edit/product.schema";
import { EditButton } from "./EditButton";
import { JoinRequestButton } from "./JoinRequestButton";
import { LeaveButton } from "./LeaveButton";
import { ProductLocationMap } from "./ProductLocationMap";
import { RemoveMemberButton } from "./RemoveMemberButton";
import { SeeAllReviewsButton } from "./SeeAllReviewsButton";

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

export default async function RoutePage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;

  const { slug } = params;

  // Obtenir les traductions
  const { t, locale } = await getServerTranslations();

  const user = await currentUser();

  // Vérification améliorée du slug
  if (!slug || typeof slug !== "string") {
    console.error(
      `Erreur critique: Slug invalide. Valeur reçue: "${slug}", type: ${typeof slug}`
    );
    // On pourrait rediriger vers la page liste des produits comme fallback
    notFound();
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
      slug: slug,
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
    console.error(`Produit non trouvé pour le slug: "${slug}"`);
    notFound();
  }

  // Définir les variables avant de les utiliser
  const isOwner = user ? product.userId === user.id : false;
  const isClient = user ? product.userId !== user.id : false;
  const isMember = user
    ? product.memberships.some(
        (m) => m.userId === user.id && m.status === "APPROVED"
      )
    : false;
  const canManageProduct = user ? isOwner || user.isAdmin : false;
  const canViewMessages = user
    ? isOwner || isMember || (user.isAdmin ?? false)
    : false;

  const activeMemberships = product.memberships.filter(
    (m) => m.status === "APPROVED"
  );
  const membership = user
    ? product.memberships.find((m) => m.userId === user.id)
    : undefined;

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
        {/* Fil d'Ariane */}
        <Breadcrumb
          items={[
            {
              href: `/${locale}/products`,
              label: t("Products.Title", "Annonces"),
            },
            { label: product.name },
          ]}
        />

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
                      {getFirstName(product.user.name)}
                    </Link>
                  ) : (
                    <Link
                      href={`/${locale}/profile/${product.userId}`}
                      className="cursor-pointer text-sm hover:underline"
                    >
                      {getFirstName(product.user.name)}
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
              {user ? (
                <>
                  {canManageProduct && pendingMemberships.length > 0 && (
                    <AcceptRequestButton
                      membership={pendingMemberships[0]}
                      count={pendingCount}
                    />
                  )}

                  {canManageProduct && (
                    <>
                      {isOwner && (
                        <Crown size={16} className="text-yellow-500" />
                      )}
                      <EditButton productSlug={product.slug} />
                      <DeleteButton productId={product.id} />
                    </>
                  )}

                  {isClient && !membership && (
                    <JoinRequestButton
                      productId={product.id}
                      userId={user.id}
                    />
                  )}

                  {isClient &&
                    membership &&
                    membership.status === "PENDING" && (
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

                  {isClient &&
                    membership &&
                    membership.status === "APPROVED" && (
                      <div className="flex items-center gap-2">
                        <span className="flex items-center">
                          <CheckCircle
                            size={16}
                            className="mr-2 text-green-600"
                          />
                          {t("Products.Actions.YouAreMember", "Tu es membre")}
                        </span>
                        <LeaveButton productId={product.id} userId={user.id} />
                      </div>
                    )}

                  {isClient &&
                    membership &&
                    membership.status === "REMOVED" && (
                      <div className="flex items-center gap-2">
                        <button
                          className={buttonVariants({
                            size: "sm",
                            variant: "destructive",
                          })}
                          disabled
                        >
                          {t(
                            "Products.Actions.RejectedRequest",
                            "Adhésion refusée"
                          )}
                        </button>
                      </div>
                    )}
                </>
              ) : (
                <Link
                  href="/login"
                  className={buttonVariants({
                    size: "sm",
                  })}
                >
                  {t("Auth.SignIn", "Se connecter")}
                </Link>
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
                    {user ? (
                      <ProductLocationMap product={product} userId={user.id} />
                    ) : (
                      <div className="mb-4 mt-2 h-32 w-full overflow-hidden rounded-xl border shadow-sm sm:h-36">
                        <div className="flex h-full items-center justify-center">
                          <p className="text-sm text-muted-foreground">
                            {t(
                              "Products.ConnectToViewMap",
                              "Connectez-vous pour voir la carte"
                            )}
                          </p>
                        </div>
                      </div>
                    )}
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
                      {user?.isAdmin && (
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
                        {user?.isAdmin && (
                          <TableCell className="text-right">
                            <DeleteReviewButton reviewId={review.id} />
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {user
                  ? isClient &&
                    membership &&
                    membership.status === "APPROVED" && (
                      <div className="mt-4">
                        <Link
                          href={`/${locale}/r/${encodeURIComponent(
                            product.slug
                          )}`}
                          className={buttonVariants({
                            size: "sm",
                          })}
                          prefetch={true}
                        >
                          <Link2 size={16} className="mr-2" />
                          {t("Products.WriteReview", "Écrire un avis")}
                        </Link>
                      </div>
                    )
                  : null}
                <div className="mt-2">
                  <SeeAllReviewsButton slug={product.slug} />
                </div>
              </CardContent>
            </Card>
          </Suspense>
        </div>

        {user && isOwner && (
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
                          <p>{getFirstName(membership.user.name)}</p>
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

        {user && canViewMessages && (
          <Suspense fallback={<ChatSkeleton />}>
            <ChatComponent
              productId={product.id}
              userId={user.id}
              isAdmin={user.isAdmin}
            />
          </Suspense>
        )}

        {!user ? (
          <div className="space-y-4">
            <p>
              {t(
                "Products.UnauthenticatedMessage",
                "Connectez-vous pour rejoindre cette activité et discuter avec les participants."
              )}
            </p>
            <Link href="/login" className={buttonVariants({ size: "lg" })}>
              {t("Auth.SignIn", "Se connecter")}
            </Link>
          </div>
        ) : !canViewMessages ? (
          <p>
            {t(
              "Products.JoinToAccessMessage",
              "Rejoignez cette activité pour accéder au chat et aux détails supplémentaires."
            )}
          </p>
        ) : null}
      </div>
    </Layout>
  );
}

// Génération de métadonnées SEO pour la page de produits
export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { slug } = params;

  try {
    const product = await prisma.product.findUnique({
      where: { slug: slug },
      select: {
        name: true,
        description: true,
        sport: true,
      },
    });

    if (!product) {
      return createSeoMetadata({
        title: "Annonce non trouvée | co-sport.com",
        description: "Cette annonce n'existe pas ou a été supprimée.",
        path: `/products/${slug}`,
        noindex: true,
      });
    }

    return createSeoMetadata({
      title: `${product.name} - ${product.sport} | co-sport.com`,
      description:
        product.description ||
        `Participez à l'activité ${product.name} (${product.sport}) sur co-sport.com.`,
      path: `/products/${slug}`,
      // Autoriser l'indexation par les moteurs de recherche
      noindex: false,
    });
  } catch (error) {
    console.error("Erreur lors de la génération des métadonnées:", error);
    return createSeoMetadata({
      title: "Erreur | co-sport.com",
      description: "Une erreur s'est produite lors du chargement de l'annonce.",
      path: `/products/${slug}`,
      noindex: true,
    });
  }
}
