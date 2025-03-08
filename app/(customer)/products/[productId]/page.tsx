import { currentUser } from "@/auth/current-user";
import { Layout, LayoutTitle } from "@/components/layout";
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
import { prisma } from "@/prisma";
import type { PageParams } from "@/types/next";
import { CheckCircle, Crown, Link2, MapPin } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AcceptRequestButton } from "./AcceptButton";
import { ChatComponent } from "./Chat";
import { DeleteButton } from "./DeleteButton";
import { JoinButton } from "./JoinButton";
import { LeaveButton } from "./LeaveButton";
import { RemoveMemberButton } from "./RemoveMemberButton";
import { LEVEL_CLASSES, SPORTS } from "./edit/product.schema";

export default async function RoutePage({
  params: { productId },
}: PageParams<{ productId: string }>) {
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
    (m) => m.userId === user.id && m.status === "APPROVED",
  );
  const canManageProduct = isOwner || user.isAdmin;
  const canViewMessages = isOwner || isMember || user.isAdmin;

  const activeMemberships = product.memberships.filter(
    (m) => m.status === "APPROVED",
  );
  const membership = product.memberships.find((m) => m.userId === user.id);

  const pendingMemberships = product.memberships.filter(
    (m) => m.status === "PENDING",
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
          <Link href="/products" className="hover:text-foreground">
            Annonces
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
                  href={`/profile/${product.userId}`}
                  className="cursor-pointer text-sm hover:underline"
                >
                  {product.user.name}
                </Link>
              )}
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
                  href={`/products/${product.id}/edit`}
                  className={buttonVariants({
                    size: "sm",
                    variant: "secondary",
                  })}
                >
                  Edit
                </Link>
                <DeleteButton productId={product.id} />
              </>
            )}
          </div>

          {isClient && !membership && (
            <JoinButton productId={product.id} userId={user.id} />
          )}

          {isClient && membership && membership.status === "PENDING" && (
            <div className="flex items-center gap-2">
              <button
                className={buttonVariants({ size: "sm", variant: "secondary" })}
                disabled
              >
                En attente d'acceptation...
              </button>
            </div>
          )}

          {isClient && membership && membership.status === "APPROVED" && (
            <div className="flex items-center gap-2">
              <span className="flex items-center">
                <CheckCircle size={16} className="mr-2 text-green-600" />
                Tu es membre
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
                Adhésion refusée
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-lg">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getSportIcon(product.sport)}</span>
            <span>{product.sport}</span>
          </div>
          <span className="text-muted-foreground">•</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getLevelIcon(product.level)}</span>
            <span>{product.level}</span>
          </div>
        </div>

        <div className="flex gap-4 max-lg:flex-col">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Détails</CardTitle>
            </CardHeader>
            <CardHeader>
              {product.venueName && (
                <div className="mt-2 flex items-start gap-2">
                  <MapPin className="mt-1 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{product.venueName}</p>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex flex-col items-start gap-2">
              <p>Description : {product.description}</p>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Avis</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader className="pointer-events-none">
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Avis</TableHead>
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
                    Écrire un avis
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
                  Voir tous les avis
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        {isOwner && (
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Membres</CardTitle>
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
                            Réseau social
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
