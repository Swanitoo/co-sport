import { requiredCurrentUser } from "@/auth/current-user";
import { Layout, LayoutTitle } from "@/components/layout";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/prisma";
import type { PageParams } from "@/types/next";
import { CheckCircle, Link2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "./DeleteButton";
import { JoinButton } from "./JoinButton";
import { AcceptRequestButton } from "./AcceptButton";
import { LeaveButton } from "./LeaveButton";
import { RemoveMemberButton } from "./RemoveMemberButton";

export default async function RoutePage(
  props: PageParams<{
    productId: string;
  }>
) {
  const user = await requiredCurrentUser();
  const product = await prisma.product.findUnique({
    where: {
      id: props.params.productId,
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
          }
        }
      },
      memberships: {
        include: {
          user: {
            select: {
              name: true,
              socialLink: true,
              image: true,
            }
          }
        }
      }
    },
  });

  if (!product) {
    notFound();
  }

  const isOwner = product.userId === user.id; 
  const isClient = product.userId !== user.id; 

  const activeMemberships = product.memberships.filter(m => m.status === 'APPROVED');
  const membership = product.memberships.find(m => m.userId === user.id);

  const pendingMemberships = product.memberships.filter(m => m.status === 'PENDING');
  const pendingCount = pendingMemberships.length;

  return (
    <Layout>
      <div className="flex justify-between">
        <div className="space-y-0.5">
          <LayoutTitle>{product.name}</LayoutTitle>
          {product.user.socialLink ? (
            <Link href={product.user.socialLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
              {product.user.name}
            </Link>
          ) : (
            <p className="text-sm text-gray-600">{product.user.name}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
        {isOwner && pendingMemberships.length > 0 && (
            <AcceptRequestButton membership={pendingMemberships[0]} count={pendingCount} />
        )}

        {isOwner && (
          <>
            <Link
              href={`/products/${product.id}/edit`}
              className={buttonVariants({ size: "sm", variant: "secondary" })}
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

        {isClient && membership && membership.status === 'PENDING' && (
          <div className="flex items-center gap-2">
            <button
              className={buttonVariants({ size: "sm", variant: "secondary" })}
              disabled
            >
              En attente d'acceptation...
            </button>
          </div>
        )}

        {isClient && membership && membership.status === 'APPROVED' && (
          <div className="flex items-center gap-2">
          <span className="flex items-center">
            <CheckCircle size={16} className="mr-2 text-green-600" />
            Vous êtes membre
          </span>
          <LeaveButton productId={product.id} userId={user.id} />
        </div>
        )}

        {isClient && membership && membership.status === 'REMOVED' && (
          <div className="flex items-center gap-2">
            <button
              className={buttonVariants({ size: "sm", variant: "destructive" })}
              disabled
            >
              Adhésion refusée
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-4 max-lg:flex-col">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Détails</CardTitle>
          </CardHeader>
          <CardHeader>
            <CardTitle>Détails</CardTitle>
            <p>Sport : {product.sport}</p>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 items-start">
            {isClient && membership && membership.status === 'APPROVED' && (
            <Link
              href={`/r/${product.slug}`}
              className={buttonVariants({
                size: "sm",
              })}
            >
              <Link2 size={16} className="mr-2" />
              Écris un avis
              </Link>
            )}
            <Link
              href={`/wall/${product.slug}`}
              className={buttonVariants({
                size: "sm",
              })}
            >
              <Link2 size={16} className="mr-2" />
              Découvre tout les avis
            </Link>
            <p>Description : {product.description}</p>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Avis</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Text</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {product.reviews.map((review) => (
                  <TableRow key={product.id}>
                    <TableCell>
                        <Link href={`/reviews/${product.id}`} key={product.id}>
                        {product.name}
                        </Link>
                    </TableCell>
                    <TableCell>{review.text}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
    </Layout>
  );
}