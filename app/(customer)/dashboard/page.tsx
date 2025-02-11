import { requiredCurrentUser } from "@/auth/current-user";
import { Layout, LayoutTitle } from "@/components/layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { prisma } from "@/prisma";
import type { PageParams } from "@/types/next";
import { Globe, MapPin, Pencil } from "lucide-react";
import Link from "next/link";
import { ReviewItem } from "../../(user)/wall/[slug]/ReviewCard";
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

  const userProducts = await prisma.product.findMany({
    where: {
      userId: user.id,
    },
    include: {
      memberships: {
        where: { status: "PENDING" }
      }
    },
  });

  const productsWithPendingCount = userProducts.map(product => ({
    ...product,
    pendingRequests: product.memberships.length
  }));

  const approvedRequests = await prisma.membership.findMany({
    where: {
      userId: user.id,
      status: "APPROVED",
      read: false,
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 derniers jours
      }
    },
    include: {
      product: true,
      user: true
    }
  });

  const formattedApprovedRequests = approvedRequests.map(request => ({
    id: request.id,
    productId: request.productId,
    productName: request.product.name,
    userName: request.user.name || "Utilisateur inconnu",
    createdAt: request.createdAt
  }));

  const pendingRequests = await prisma.membership.findMany({
    where: {
      product: {
        userId: user.id
      },
      status: "PENDING",
      read: false
    },
    include: {
      product: true,
      user: true
    }
  });

  const formattedPendingRequests = pendingRequests.map(request => ({
    id: request.id,
    productId: request.productId,
    productName: request.product.name,
    userName: request.user.name || "Utilisateur inconnu",
    createdAt: request.createdAt
  }));

  return (
    <Layout>
      <ProfileDataCheck needsSex={!user.sex} needsCountry={!user.country} />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <LayoutTitle>Tableau de bord</LayoutTitle>
            <h2 className="text-xl font-medium text-muted-foreground">
              Content de te voir, {user.name}
            </h2>
          </div>
          <Avatar className="size-20">
            <AvatarImage src={user.image || undefined} />
            <AvatarFallback>{user.name?.[0]}</AvatarFallback>
          </Avatar>
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
                          defaultValue={user.birthDate
                            ? new Date(user.birthDate).toISOString().split("T")[0]
                            : undefined}
                        />
                        <DialogClose asChild>
                          <Button type="submit">Enregistrer</Button>
                        </DialogClose>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>

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

          <Card className="md:col-span-2 lg:col-span-3">
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

          <NotificationsCard 
            pendingRequests={formattedPendingRequests} 
            approvedRequests={formattedApprovedRequests}
          />

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
                    className="block p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{product.name}</h3>
                      {product.pendingRequests > 0 && (
                        <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                          {product.pendingRequests}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{product.sport}</span>
                      <span>•</span>
                      <span>{product.level}</span>
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
