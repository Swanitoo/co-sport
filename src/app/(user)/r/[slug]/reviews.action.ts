"use server";

import { currentUser } from "@/auth/current-user";
import { sendReviewReceivedEmail } from "@/lib/emails";
import { prisma } from "@/prisma";
import { ActionError, action } from "@/safe-actions";
import { headers } from "next/headers";
import { z } from "zod";
import { ReviewSchema } from "./review.schema";

export const getReviewAction = action(
  z.object({
    productId: z.string(),
    id: z.string().optional(),
  }),
  async (input) => {
    if (!input.id) {
      return null;
    }

    const review = await prisma.review.findUnique({
      where: {
        id: input.id,
        productId: input.productId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            socialLink: true,
          },
        },
      },
    });

    return review;
  }
);

export const updateReviewAction = action(ReviewSchema, async (input) => {
  const user = await currentUser();

  if (!user) {
    throw new ActionError("Vous devez être connecté pour laisser un avis");
  }

  const headerList = headers();
  const userIp =
    headerList.get("x-real-ip") ||
    headerList.get("x-forwarded-for") ||
    "127.0.0.1";

  const reviewData = {
    text: input.text,
    rating: input.rating,
    userId: user.id,
    name: user.name,
    image: user.image,
    socialLink: user.socialLink,
    ip: userIp,
  };

  let review;
  let isNewReview = false;

  if (input.id) {
    review = await prisma.review.update({
      where: {
        id: input.id,
      },
      data: reviewData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            socialLink: true,
          },
        },
        product: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });
  } else {
    isNewReview = true;
    review = await prisma.review.create({
      data: {
        ...reviewData,
        productId: input.productId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            socialLink: true,
          },
        },
        product: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
          select: {
            id: true,
            name: true,
            slug: true,
            userId: true,
          },
        },
      },
    });

    // Envoyer un email au propriétaire du produit lors d'un nouvel avis
    if (review.product?.user?.email) {
      await sendReviewReceivedEmail({
        email: review.product.user.email,
        productName: review.product.name,
        productId: review.product.id,
        reviewerName: user.name || "Un utilisateur",
        rating: review.rating,
        reviewText: review.text || "",
        userId: review.product.user.id,
        slug: review.product.slug,
      });
    }
  }

  return review;
});

export const deleteReviewAction = action(
  z.object({
    reviewId: z.string(),
  }),
  async (input) => {
    const user = await currentUser();

    if (!user) {
      throw new ActionError("Vous devez être connecté");
    }

    if (!user.isAdmin) {
      throw new ActionError("Vous n'avez pas les droits nécessaires");
    }

    try {
      await prisma.review.delete({
        where: {
          id: input.reviewId,
        },
      });
      return { success: true };
    } catch (error) {
      throw new ActionError("Erreur lors de la suppression de l'avis");
    }
  }
);

export const adminUpdateReviewAction = action(
  z.object({
    reviewId: z.string(),
    text: z.string().optional(),
    rating: z.number().optional(),
  }),
  async (input) => {
    const user = await currentUser();

    if (!user) {
      throw new ActionError("Vous devez être connecté");
    }

    if (!user.isAdmin) {
      throw new ActionError("Vous n'avez pas les droits nécessaires");
    }

    try {
      const updatedReview = await prisma.review.update({
        where: {
          id: input.reviewId,
        },
        data: {
          text: input.text,
          rating: input.rating,
        },
        include: {
          user: true,
        },
      });
      return updatedReview;
    } catch (error) {
      throw new ActionError("Erreur lors de la modification de l'avis");
    }
  }
);
