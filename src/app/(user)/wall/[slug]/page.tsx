import { currentUser } from "@/auth/current-user";
import { Layout } from "@/components/layout";
import { Button, buttonVariants } from "@/components/ui/button";
import { Header } from "@/features/layout/Header";
import { prisma } from "@/prisma";
import type { PageParams } from "@/types/next";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { DeleteReviewButton } from "./DeleteReviewButton";
import { ReviewItem } from "./ReviewCard";

export const maxDuration = 10;

export const dynamic = "force-dynamic";
export const revalidate = 300;

export default async function RoutePage(props: PageParams<{ slug: string }>) {
  const user = await currentUser();

  const decodedSlug = decodeURIComponent(props.params.slug);
  // 🔍 Slug décodé

  const product = await prisma.product.findUnique({
    where: { slug: decodedSlug },
    include: {
      user: true,
      memberships: {
        include: {
          user: true,
        },
      },
      reviews: {
        include: {
          user: true,
        },
      },
    },
  });
  // 📦 Produit trouvé

  if (!product) {
    return (
      <>
        <Header />
        <Layout>
          <div className="flex min-h-screen flex-col items-center justify-center">
            <h1 className="mb-4 text-2xl font-bold">Produit non trouvé</h1>
            <p>Désolé, nous n'avons pas pu trouver le produit demandé.</p>
            <Button variant="ghost" className="mt-4" asChild>
              <Link href="/products" className="flex items-center gap-2">
                <ArrowLeft size={16} />
                Retour aux annonces
              </Link>
            </Button>
          </div>
        </Layout>
      </>
    );
  }

  const reviewsWithUserData = product?.reviews.map((review) => ({
    ...review,
    user: review.user,
  }));
  // 📝 Avis avec données utilisateur

  // calcule la moyenne des reviews
  const review = await prisma.review.aggregate({
    where: {
      productId: product.id,
      text: {
        not: null,
      },
    },
    _avg: {
      rating: true,
    },
    _count: {
      _all: true,
    },
  });

  const isAdmin = user?.isAdmin ?? false;

  return (
    <>
      <Header />
      <Layout className="my-12 flex h-full flex-col items-center justify-center gap-4">
        <div className="container mx-auto py-8">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/products/${product.id}`}
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                })}
              >
                <ArrowLeft className="mr-2 size-4" />
                Retour à l'annonce
              </Link>
              <h1 className="text-2xl font-bold">{product.name}</h1>
            </div>
          </div>

          <div className="space-y-8">
            {reviewsWithUserData.length === 0 ? (
              <p className="text-center text-muted-foreground">
                Aucun avis pour le moment
              </p>
            ) : (
              reviewsWithUserData.map((review) => (
                <div
                  key={review.id}
                  className="flex items-start justify-between"
                >
                  <ReviewItem review={review} isAdmin={isAdmin} />
                  {isAdmin && (
                    <div className="flex gap-2">
                      <Link
                        href={`/r/${encodeURIComponent(product.slug)}/edit/${
                          review.id
                        }`}
                        className={buttonVariants({
                          variant: "ghost",
                          size: "sm",
                        })}
                      >
                        <Pencil className="size-4" />
                      </Link>
                      <DeleteReviewButton reviewId={review.id} />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}
