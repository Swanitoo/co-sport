"use server";

import { ActionError, userAction } from "@/safe-actions";
import { ProductSchema } from "./product.schema";
import { prisma } from "@/prisma";

export const createProductAction = userAction(
    ProductSchema, 
    async (input, context) => {
        const slugExists = await prisma.product.count({
            where: {
                slug: input.slug,
            },
        });

        if (slugExists) {
            throw new ActionError("Slug already exists");
        }

        const product = await prisma.product.create({
            data: {
                ...input,
                userId: context.user.id,
            },
        });

        return product;
    }
);

export const editProductAction = async () => {};