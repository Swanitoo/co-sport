"use server";

import { ActionError, userAction } from "@/safe-actions";
import { ProductSchema } from "./product.schema";
import { prisma } from "@/prisma";
import { z } from "zod";
import { User } from "@prisma/client";

const verifySlugUniqueness = async (slug: string, productId?: string) => {
    const slugExists = await prisma.product.count({
        where: {
            slug: slug,
            id: productId ? {
                not: productId,
            } : undefined,
        },
    });

    if (slugExists) {
        throw new ActionError("Slug already exists");
    }
};

const verifyUserPlan = async (user: User) => {
    if (user.plan === "PREMIUM") {
        return;
    }
    
    const userProductsCount = await prisma.product.count({
        where: {
            userId: user.id,
        },
    });

    if (userProductsCount > 0) {
        throw new ActionError(
            "You need to upgrade to premium to create more products"
        );
    }
};

export const createProductAction = userAction(
    ProductSchema, 
    async (input, context) => {
        await verifySlugUniqueness(input.slug);
        await verifyUserPlan(context.user)

        const product = await prisma.product.create({
            data: {
                ...input,
                userId: context.user.id,
            },
        });

        return product;
    }
);

export const updateProductAction = userAction(
    z.object({
        id: z.string(),
        data: ProductSchema,
    }),
    async (input, context) => {
        await verifySlugUniqueness(input.data.slug, input.id);

        const updatedProduct = await prisma.product.update({
            where: {
                id: input.id,
                userId: context.user.id,
            },
            data: input.data,
        });
        
        return updatedProduct;
    }
);
