"use server"

import { prisma } from "@/prisma";
import { ActionError, action } from "@/safe-actions";
import { Review } from "@prisma/client";
import { z } from "zod";
import { ReviewSchema } from "./review.schema";
import { headers } from "next/headers";

export const getReviewAction = action(
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
    ReviewSchema,
        async (input) => {
            const headerList = headers();
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
            return review;
        }
);