"use server"

import { currentUser } from "@/auth/current-user";
import { prisma } from "@/prisma";
import { ActionError, action } from "@/safe-actions";
import { getSocketIO } from "@/socketio";
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
                    }
                }
            }
        });

        return review;
    }
);

export const updateReviewAction = action(
    ReviewSchema,
    async (input) => {
        const user = await currentUser();
        
        if (!user) {
            throw new ActionError("Vous devez être connecté pour laisser un avis");
        }

        const headerList = headers();
        const userIp = 
            headerList.get("x-real-ip") || headerList.get("x-forwarded-for") || "127.0.0.1";
        
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
                        }
                    },
                    product: true
                }
            });
        } else {
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
                        }
                    },
                    product: true
                }
            });

            // Émettre l'événement Socket.IO
            const io = getSocketIO();
            io.to(review.product.userId).emit("new-review", {
                id: review.id,
                user: {
                    name: user.name,
                },
                productSlug: review.product.slug,
            });
        }

        return review;
    }
);

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
                    user: true
                }
            });
            return updatedReview;
        } catch (error) {
            throw new ActionError("Erreur lors de la modification de l'avis");
        }
    }
);