"use server";

import { requiredCurrentUser } from "@/auth/current-user";
import { EMAIL_FROM } from "@/config";
import { prisma } from "@/prisma";
import { resend } from "@/resend";
import { userAction } from "@/safe-actions";
import { Prisma, Status, User } from "@prisma/client";
import { z } from "zod";
import FirstProductCreatedEmail from "../../../../../emails/FirstProductCreatedEmail";
import { ProductSchema } from "./product.schema";

const generateSlug = (name: string, level: string) => {
  const slugBase = `${name.replace(/\s+/g, "-").toLowerCase()}-${level
    .replace(/\s+/g, "-")
    .toLowerCase()}`;
  return slugBase;
};

const verifySlugUniqueness = async (
  slug: string,
  productId?: string
): Promise<string> => {
  let uniqueSlug = slug;
  let slugExists = await prisma.product.count({
    where: {
      slug: uniqueSlug,
      id: productId
        ? {
            not: productId,
          }
        : undefined,
    },
  });

  let counter = 1;
  while (slugExists > 0) {
    uniqueSlug = `${slug}-${counter}`;
    slugExists = await prisma.product.count({
      where: {
        slug: uniqueSlug,
        id: productId
          ? {
              not: productId,
            }
          : undefined,
      },
    });
    counter++;
  }

  return uniqueSlug;
};

// const verifyUserPlan = async (user: User) => {
//   if (user.plan === "PREMIUM") {
//     return;
//   }

//   const userProductsCount = await prisma.product.count({
//     where: {
//       userId: user.id,
//     },
//   });

//   if (userProductsCount > 3) {
//     throw new ActionError(
//       "Tu dois passer au Premium pour créer plus de produits"
//     );
//   }
// };

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

    // await verifyUserPlan(context.user);

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

    const product = await prisma.product.findUnique({
      where: { id: input.id },
      select: { userId: true },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.userId !== context.user.id && !context.user.isAdmin) {
      throw new Error("Not authorized");
    }

    const updatedProduct = await prisma.product.update({
      where: {
        id: input.id,
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
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { userId: true },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.userId !== context.user.id && !context.user.isAdmin) {
      throw new Error("Not authorized");
    }

    await prisma.product.delete({
      where: {
        id: productId,
      },
    });
  }
);

export async function joinProductAction({
  productId,
  userId,
  comment,
}: {
  productId: string;
  userId: string;
  comment: string;
}) {
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
    return { data: "success" };
  } catch (error) {
    console.error("Erreur lors de la demande d'adhésion:", error);
    return {
      serverError: "Une erreur est survenue. Veuillez réessayer plus tard.",
    };
  }
}

export async function acceptMembershipAction(membershipId: string) {
  try {
    await prisma.membership.update({
      where: { id: membershipId },
      data: { status: "APPROVED" },
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur lors de l'acceptation de la demande:", error);
    return {
      success: false,
      error: "Erreur lors de l'acceptation de la demande.",
    };
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

export async function removeMemberAction({
  membershipId,
  comment,
}: {
  membershipId: string;
  comment: string;
}) {
  try {
    await prisma.membership.update({
      where: { id: membershipId },
      data: {
        status: "REFUSED",
        comment: comment,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur lors du retrait du membre:", error);
    return { success: false, error: "Erreur lors du retrait du membre." };
  }
}

// Liste de mots interdits (à compléter selon vos besoins)
const BANNED_WORDS = [
  "merde", "putain", "connard", "connasse", "enculé", "pute",
  // Ajoutez d'autres mots selon vos besoins
];

const sanitizeMessage = (text: string): { text: string; isValid: boolean; error?: string } => {
  const sanitized = text
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'")
    .trim();

  if (sanitized.length === 0) {
    return { text: sanitized, isValid: false, error: "Le message ne peut pas être vide" };
  }
  if (sanitized.length > 1000) {
    return { text: sanitized, isValid: false, error: "Le message est trop long (maximum 1000 caractères)" };
  }

  const containsBannedWord = BANNED_WORDS.some(word => {
    const hasWord = new RegExp(`\\b${word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i').test(sanitized);
    return hasWord;
  });
  
  if (containsBannedWord) {
    return { text: sanitized, isValid: false, error: "Le message contient des mots interdits" };
  }

  if (/(.)\1{10,}/.test(sanitized)) {
    return { text: sanitized, isValid: false, error: "Le message contient trop de caractères répétés" };
  }

  return { text: sanitized, isValid: true };
};

export async function sendMessageAction({
  text,
  productId,
  replyToId,
}: {
  text: string;
  productId: string;
  replyToId?: string;
}) {
  try {
    const user = await requiredCurrentUser();
    const sanitized = sanitizeMessage(text);

    if (!sanitized.isValid) {
      return { error: sanitized.error };
    }

    const messageData: Prisma.MessageCreateInput = {
      text: sanitized.text,
      user: { connect: { id: user.id } },
      product: { connect: { id: productId } },
      ...(replyToId && { replyTo: { connect: { id: replyToId } } }),
    };

    const message = await prisma.message.create({
      data: messageData,
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        replyTo: {
          select: {
            id: true,
            text: true,
            userId: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return { data: message };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Une erreur est survenue" };
  }
}

export const getMessagesAction = userAction(
  z.object({
    productId: z.string(),
    page: z.number().optional().default(1),
    limit: z.number().optional().default(20),
  }),
  async (input, context) => {
    const skip = (input.page - 1) * input.limit;

    const messages = await prisma.message.findMany({
      where: {
        productId: input.productId,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        replyTo: {
          select: {
            id: true,
            text: true,
            userId: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: input.limit,
    });

    return messages.reverse();
  }
);

export async function deleteMessageAction(messageId: string) {
  try {
    const user = await requiredCurrentUser();
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: { userId: true },
    });

    if (!message) {
      return { error: "Message non trouvé" };
    }

    if (message.userId !== user.id && !user.isAdmin) {
      return { error: "Non autorisé" };
    }

    await prisma.message.delete({
      where: { id: messageId },
    });

    return { success: true };
  } catch (error) {
    return { error: "Erreur lors de la suppression du message" };
  }
}
