import { requiredCurrentUser } from "@/auth/current-user";
import { Layout, LayoutTitle } from "@/components/layout";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FilteredTextarea } from "@/components/ui/filtered-textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRIES } from "@/data/country";
import { ProfileImageUpload } from "@/features/upload/components/ProfileImageUpload";
import { generateMetadata as createSeoMetadata } from "@/lib/seo-config";
import { prisma } from "@/prisma";
import type { PageParams } from "@/types/next";
import { Globe, MapPin, Pencil } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ReviewItem } from "../../(user)/wall/[slug]/ReviewCard";
import {
  LEVEL_CLASSES,
  SPORTS,
} from "../products/[productId]/edit/product.schema";
import {
  updateBio,
  updateBirthDate,
  updateCountry,
  updateLocation,
  updateName,
} from "./dashboard.action";
import { NotificationsCard } from "./NotificationsCard";
import { ProfileDataCheck } from "./ProfileDataCheck";

export default async function RoutePage(props: PageParams<{}>) {
  const user = await requiredCurrentUser();

  const [productsCount, joinedSessionsCount, lastReview] = await Promise.all([
    prisma.product.count({
      where: { userId: user.id },
    }),
    prisma.membership.count({
      where: {
        userId: user.id,
        status: "APPROVED",
      },
    }),
    prisma.review.findFirst({
      where: {
        product: { userId: user.id },
        text: { not: null },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Récupérer les messages non lus
  const unreadMessages = await prisma.unreadMessage.findMany({
    where: {
      userId: user.id,
    },
    include: {
      message: {
        include: {
          product: true,
          user: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Regrouper les messages non lus par productId
  const groupedUnreadMessages = unreadMessages.reduce(
    (acc, unread) => {
      const productId = unread.message.productId;
      if (!acc[productId]) {
        acc[productId] = {
          productId,
          productName: unread.message.product.name,
          messages: [],
          latestMessageDate: new Date(0),
        };
      }

      acc[productId].messages.push({
        id: unread.id,
        messageId: unread.message.id,
        userName: unread.message.user.name || "Utilisateur inconnu",
        createdAt: unread.createdAt,
        messageText: unread.message.text,
      });

      // Mettre à jour la date du message le plus récent
      if (new Date(unread.createdAt) > acc[productId].latestMessageDate) {
        acc[productId].latestMessageDate = new Date(unread.createdAt);
      }

      return acc;
    },
    {} as Record<
      string,
      {
        productId: string;
        productName: string;
        messages: {
          id: string;
          messageId: string;
          userName: string;
          createdAt: Date;
          messageText: string;
        }[];
        latestMessageDate: Date;
      }
    >
  );

  // Convertir l'objet en tableau et trier par date du message le plus récent
  const formattedUnreadMessages = Object.values(groupedUnreadMessages)
    .map((group) => ({
      id: group.messages[0].id, // Utiliser l'ID du premier message non lu comme ID de groupe
      messageIds: group.messages.map((m) => m.id), // Liste de tous les IDs de messages non lus
      productId: group.productId,
      productName: group.productName,
      messageCount: group.messages.length,
      userName:
        group.messages.length > 1
          ? `${group.messages[0].userName} et ${
              group.messages.length - 1
            } autre${group.messages.length > 2 ? "s" : ""}`
          : group.messages[0].userName,
      createdAt: group.latestMessageDate,
      messageText: group.messages[0].messageText,
    }))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const userProducts = await prisma.product.findMany({
    where: {
      userId: user.id,
    },
    include: {
      memberships: {
        where: { status: "PENDING" },
      },
    },
  });

  const productsWithPendingCount = userProducts.map((product) => ({
    ...product,
    pendingRequests: product.memberships.length,
  }));

  const approvedRequests = await prisma.membership.findMany({
    where: {
      userId: user.id,
      status: "APPROVED",
      read: false,
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 derniers jours
      },
    },
    include: {
      product: true,
      user: true,
    },
  });

  const formattedApprovedRequests = approvedRequests.map((request) => ({
    id: request.id,
    productId: request.productId,
    productName: request.product.name,
    userName: request.user.name || "Utilisateur inconnu",
    createdAt: request.createdAt,
  }));

  const pendingRequests = await prisma.membership.findMany({
    where: {
      product: {
        userId: user.id,
      },
      status: "PENDING",
      read: false,
    },
    include: {
      product: true,
      user: true,
    },
  });

  const formattedPendingRequests = pendingRequests.map((request) => ({
    id: request.id,
    productId: request.productId,
    productName: request.product.name,
    userName: request.user.name || "Utilisateur inconnu",
    createdAt: request.createdAt,
  }));

  // Récupérer les avis non lus
  const unreadReviews = await prisma.review.findMany({
    where: {
      product: {
        userId: user.id,
      },
      read: false,
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 derniers jours
      },
    },
    include: {
      product: true,
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedUnreadReviews = unreadReviews.map((review) => ({
    id: review.id,
    productId: review.productId,
    productName: review.product.name,
    userName: review.user.name || "Utilisateur inconnu",
    createdAt: review.createdAt,
    rating: review.rating,
    text: review.text || "",
    level: review.product.level,
  }));

  // Récupérer les annonces rejointes
  const joinedProducts = await prisma.product.findMany({
    where: {
      memberships: {
        some: {
          userId: user.id,
          status: "APPROVED",
        },
      },
    },
    include: {
      user: {
        select: {
          name: true,
          country: true,
        },
      },
    },
  });

  return (
    <Layout>
      <ProfileDataCheck
        needsSex={!user.sex}
        needsCountry={!user.country}
        needsEmail={!user.email}
        shouldAskLinkStrava={
          !user.stravaConnected && !user.stravaLinkRefused && !!user.email
        }
      />
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="order-1 text-center sm:order-1 sm:text-left">
            <LayoutTitle>Tableau de bord</LayoutTitle>
            <h2 className="text-xl font-medium text-muted-foreground">
              Content de te voir, {user.name}
            </h2>
          </div>
          <div className="order-2 sm:order-2">
            <ProfileImageUpload
              currentImage={user.image}
              userName={user.name}
              userCountry={user.country}
              size="lg"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle>Profil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Nom</span>
                <div className="flex items-center gap-2">
                  <span>{user.name}</span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground">
                        <Pencil className="size-4" />
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Modifier mon nom</DialogTitle>
                      </DialogHeader>
                      <form action={updateName} className="space-y-4">
                        <Input
                          name="name"
                          defaultValue={user.name || ""}
                          placeholder="Entrez votre nom"
                        />
                        <DialogClose asChild>
                          <Button type="submit">Enregistrer</Button>
                        </DialogClose>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Bio</span>
                <div className="flex items-center gap-2">
                  <span className="line-clamp-3 max-w-[200px] text-right">
                    {user.bio || "Non renseignée"}
                  </span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground">
                        <Pencil className="size-4" />
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Modifier ma bio</DialogTitle>
                      </DialogHeader>
                      <form action={updateBio} className="space-y-4">
                        <FilteredTextarea
                          name="bio"
                          defaultValue={user.bio || ""}
                          placeholder="Entrez votre bio (max 300 caractères)"
                          className="min-h-[100px]"
                        />
                        <DialogClose asChild>
                          <Button type="submit">Enregistrer</Button>
                        </DialogClose>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ville</span>
                <div className="flex items-center gap-2">
                  <MapPin className="size-4" />
                  <span>{user.city || "Non renseignée"}</span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground">
                        <Pencil className="size-4" />
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Modifier ma ville</DialogTitle>
                      </DialogHeader>
                      <form action={updateLocation} className="space-y-4">
                        <Input
                          name="city"
                          defaultValue={user.city || ""}
                          placeholder="Entrez votre ville"
                        />
                        <DialogClose asChild>
                          <Button type="submit">Enregistrer</Button>
                        </DialogClose>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Nationalité</span>
                <div className="flex items-center gap-2">
                  <Globe className="size-4" />
                  <span>
                    {user.country ? (
                      <>
                        {COUNTRIES.find((c) => c.code === user.country)?.flag}{" "}
                        {COUNTRIES.find((c) => c.code === user.country)?.name}
                      </>
                    ) : (
                      "Non renseignée"
                    )}
                  </span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground">
                        <Pencil className="size-4" />
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Modifier ma nationalité</DialogTitle>
                      </DialogHeader>
                      <form action={updateCountry} className="space-y-4">
                        <Select
                          name="country"
                          defaultValue={user.country || undefined}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un pays" />
                          </SelectTrigger>
                          <SelectContent>
                            {COUNTRIES.map((country) => (
                              <SelectItem
                                key={country.code}
                                value={country.code}
                              >
                                {country.flag} {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <DialogClose asChild>
                          <Button type="submit">Enregistrer</Button>
                        </DialogClose>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Date de naissance</span>
                <div className="flex items-center gap-2">
                  <span>
                    {user.birthDate
                      ? new Date(user.birthDate).toLocaleDateString("fr-FR")
                      : "Non renseignée"}
                  </span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground">
                        <Pencil className="size-4" />
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Modifier ma date de naissance</DialogTitle>
                      </DialogHeader>
                      <form action={updateBirthDate} className="space-y-4">
                        <Input
                          type="date"
                          name="birthDate"
                          defaultValue={
                            user.birthDate
                              ? new Date(user.birthDate)
                                  .toISOString()
                                  .split("T")[0]
                              : undefined
                          }
                        />
                        <DialogClose asChild>
                          <Button type="submit">Enregistrer</Button>
                        </DialogClose>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Bouton Strava */}
              {!user.stravaConnected && (
                <div className="mt-4 border-t pt-4">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      Connectez votre compte Strava pour importer vos activités
                      sportives
                    </p>
                    <Link
                      href="/api/auth/signin?provider=strava&callbackUrl=/dashboard"
                      className={buttonVariants({
                        className:
                          "flex w-full items-center justify-center gap-2 bg-[#FC4C02] hover:bg-[#E34000]",
                      })}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="currentColor"
                      >
                        <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                      </svg>
                      Connecter avec Strava
                    </Link>
                  </div>
                </div>
              )}

              {user.stravaConnected && (
                <div className="mt-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Strava</span>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[#FC4C02]">
                        <svg
                          viewBox="0 0 24 24"
                          width="16"
                          height="16"
                          fill="currentColor"
                        >
                          <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                        </svg>
                        Connecté
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="md:col-span-2">
            <NotificationsCard
              pendingRequests={formattedPendingRequests}
              approvedRequests={formattedApprovedRequests}
              unreadMessages={formattedUnreadMessages}
              unreadReviews={formattedUnreadReviews}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <CardDescription>Annonces Créées</CardDescription>
                <CardTitle>{productsCount}</CardTitle>
              </div>
              <div>
                <CardDescription>Annonces Rejointes</CardDescription>
                <CardTitle>{joinedSessionsCount}</CardTitle>
              </div>
            </CardContent>
          </Card>

          <Card>
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
              <Link
                href="/products"
                className={buttonVariants({ size: "lg", variant: "outline" })}
              >
                Liste des annonces
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dernier commentaire</CardTitle>
            </CardHeader>
            <CardContent>
              {lastReview ? (
                <ReviewItem review={lastReview} />
              ) : (
                <p className="text-muted-foreground">
                  Pas de commentaire pour le moment
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Mes annonces</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {productsWithPendingCount.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="block rounded-lg border p-4 transition-colors hover:bg-accent/50"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-medium">{product.name}</h3>
                      {product.pendingRequests > 0 && (
                        <span className="flex size-6 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                          {product.pendingRequests}
                        </span>
                      )}
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {product.description}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        {SPORTS.find((s) => s.name === product.sport)?.icon ||
                          "🎯"}{" "}
                        {product.sport}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        {LEVEL_CLASSES.find((l) => l.name === product.level)
                          ?.icon || "🎯"}{" "}
                        {product.level}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Mes annonces rejointes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {joinedProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="block rounded-lg border p-4 transition-colors hover:bg-accent/50"
                  >
                    <div className="mb-2">
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Par {product.user.name}
                      </p>
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {product.description}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        {SPORTS.find((s) => s.name === product.sport)?.icon}{" "}
                        {product.sport}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        {
                          LEVEL_CLASSES.find((l) => l.name === product.level)
                            ?.icon
                        }{" "}
                        {product.level}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

// Génération de métadonnées SEO pour la page de tableau de bord
export async function generateMetadata(): Promise<Metadata> {
  return createSeoMetadata({
    title: "Tableau de bord | co-sport.com",
    description:
      "Gérez vos activités sportives, vos réservations et vos préférences depuis votre tableau de bord personnel.",
    path: "/dashboard",
    noindex: true, // Page privée, ne pas indexer
  });
}

// Configuration du rendu dynamique pour cette page
// Le tableau de bord contient des données personnalisées qui doivent être actualisées fréquemment
export const dynamic = "force-dynamic";
export const revalidate = 0; // Ne pas mettre en cache cette page (toujours fraîche)
