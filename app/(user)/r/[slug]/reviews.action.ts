import { prisma } from "@/prisma";
import { ActionError, action } from "@/safe-actions";
import { Review } from "@prisma/client";
import { z } from "zod";

export const getReview = action(
    z.object({
        productId: z.string(),
        id: z.string(),
    }),
    async (input) => {
        const review = await prisma.review.findUnique({
            where: {
                id: input.id,
                productId: input.productId,
            },
        });

        if (!review) {
            throw new ActionError("Review not found");
        }

        return review;
    }
);

export const updateReviewAction = action(
    z.object({
        id: z.string().optional(),
        rating: z.number().optional(),
        text: z.string().optional(),
        socialLink: z.string().optional(),
        name: z.string().optional(),
        productId: z.string(),
    }),
    async (input) => {
        const headerList = new Headers();
        const userIp = 
            headerList.get("x-real-ip") || headerList.get("x-forwarded-for");
        
        if (!userIp) {
            throw new ActionError("User IP not found");
        }

        let review: Review | null = null;

        if (input.id) {
            review = await prisma.review.findUnique({
                where: {
                    id: input.id,
                    ip: userIp,
                    productId: input.productId,
                },
            });

            if (!review) {
                throw new ActionError("Review not found");
            }

            review = await prisma.review.update({
                where: {
                    id: input.id,
                },
                data: {
                    rating: input.rating ?? review.rating,
                    text: input.text ?? review.text,
                    socialLink: input.socialLink ?? review.socialLink,
                    name: input.name ?? review.name,
                },
            });
        } else {
                review = await prisma.review.create({
                    data: {
                        productId: input.productId,
                        ip: userIp,
                        rating: input.rating ?? 0,
                        text: input.text,
                        socialLink: input.socialLink,
                        name: input.name,
                    },
                });
            }
        }
);