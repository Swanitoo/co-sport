"use server";

import { ActionError, userAction } from "@/safe-actions";
import { ProductSchema } from "./product.schema";
import { prisma } from "@/prisma";
import { z } from "zod";
import { Status, User } from "@prisma/client";
import { resend } from "@/resend";
import { EMAIL_FROM } from "@/config";
import FirstProductCreatedEmail from "../../../../../emails/FirstProductCreatedEmail";

const generateSlug = (name: string, level: string) => {
  const slugBase = `${name.replace(/\s+/g, '-').toLowerCase()}-${level.replace(/\s+/g, '-').toLowerCase()}`;
  return slugBase;
};

const verifySlugUniqueness = async (slug: string, productId?: string): Promise<string> => {
  let uniqueSlug = slug;
  let slugExists = await prisma.product.count({
      where: {
          slug: uniqueSlug,
          id: productId ? {
              not: productId,
          } : undefined,
      },
  });

  let counter = 1;
  while (slugExists > 0) {
      uniqueSlug = `${slug}-${counter}`;
      slugExists = await prisma.product.count({
          where: {
              slug: uniqueSlug,
              id: productId ? {
                  not: productId,
              } : undefined,
          },
      });
      counter++;
  }

  return uniqueSlug;
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

const sendEmailIfUserCreatedFirstProduct = async (user: User) => {
    if (user.plan === "PREMIUM") return;
  
    const userProductsCount = await prisma.product.count({
      where: {
        userId: user.id,
      },
    });
  
    if (userProductsCount !== 1) {
      return;
    }

    const product = await prisma.product.findFirst({
      where: {
        userId: user.id,
      },
      select: {
        slug: true,
        name: true,
      },
    });

    if (!product) {
      return;
    }

    await resend.emails.send({        
        to: user.email ?? "",
        subject: "You created your first product",
        from: EMAIL_FROM,
        react: FirstProductCreatedEmail({
            product: product.name,
            slug: product.slug,
        }),
    });
};
  

export const createProductAction = userAction(
  ProductSchema,
  async (input, context) => {
      const slugBase = generateSlug(input.name, input.level);
      const slug = await verifySlugUniqueness(slugBase);

      await verifyUserPlan(context.user);

      const product = await prisma.product.create({
          data: {
              ...input,
              slug,
              userId: context.user.id,
          },
      });

      await sendEmailIfUserCreatedFirstProduct(context.user);

      return product;
  }
);

export const updateProductAction = userAction(
  z.object({
      id: z.string(),
      data: ProductSchema,
  }),
  async (input, context) => {
      const slugBase = generateSlug(input.data.name, input.data.level);
      const slug = await verifySlugUniqueness(slugBase, input.id);

      const updatedProduct = await prisma.product.update({
          where: {
              id: input.id,
              userId: context.user.id,
          },
          data: {
              ...input.data,
              slug,
          },
      });

      return updatedProduct;
  }
);

export const deleteProductAction = userAction(
    z.string(),
    async (productId, context) => {
      await prisma.product.delete({
        where: {
          id: productId,
          userId: context.user.id,
        },
      });
    }
  );

export async function joinProductAction({ productId, userId, comment }: { productId: string, userId: string, comment: string; }) {
    const membershipData = {
        userId,
        productId,
        comment,
        status: Status.PENDING,
    };
    
    try {
      await prisma.membership.create({
        data: membershipData,

      });
      return { data: 'success' };
    } catch (error) {
      console.error('Erreur lors de la demande d\'adhésion:', error);
      return { serverError: 'Une erreur est survenue. Veuillez réessayer plus tard.' };
    }
}

export async function acceptMembershipAction(membershipId: string) {
    try {
      await prisma.membership.update({
        where: { id: membershipId },
        data: { status: 'APPROVED' },
      });
  
      return { success: true };
    } catch (error) {
      console.error("Erreur lors de l'acceptation de la demande:", error);
      return { success: false, error: "Erreur lors de l'acceptation de la demande." };
    }
}

export async function leaveGroupAction(productId: string, userId: string) {
    try {
      const membership = await prisma.membership.deleteMany({
        where: {
          productId: productId,
          userId: userId,
        },
      });
  
      return { data: membership };
    } catch (error) {
      return { serverError: "Erreur lors de la suppression de l'adhésion." };
    }
}

export async function refuseMembershipAction(membershipId: string) {
    try {
        const deletedMembership = await prisma.membership.delete({
            where: { id: membershipId },
        });
        return { success: true, data: deletedMembership };
    } catch (error) {
        console.error("Erreur lors du refus de la demande:", error);
        return { success: false, error: "Erreur lors du refus de la demande." };
    }
}

export async function removeMemberAction({ membershipId, comment }: { membershipId: string, comment: string }) {
    try {
      await prisma.membership.update({
        where: { id: membershipId },
        data: { 
          status: 'REFUSED',
          comment: comment 
        },
      });
  
      return { success: true };
    } catch (error) {
      console.error("Erreur lors du retrait du membre:", error);
      return { success: false, error: "Erreur lors du retrait du membre." };
    }
}
