"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/prisma";
import { userAction } from "@/safe-actions";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  ProductSchema,
  generateSlug,
  type ProductType,
} from "./product.schema";

type ActionResponse = {
  serverError?: string;
  success?: boolean;
  data?: any;
};

export async function verifySlugUniqueness(slug: string) {
  const existingProduct = await prisma.product.findUnique({
    where: { slug },
  });
  return !existingProduct;
}

export async function createProductAction(data: ProductType) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      console.error("Création de groupe : Utilisateur non connecté");
      return { serverError: "Vous devez être connecté pour créer un groupe" };
    }

    const validatedFields = ProductSchema.safeParse(data);

    if (!validatedFields.success) {
      console.error(
        "Création de groupe : Données invalides",
        validatedFields.error
      );
      return {
        serverError:
          "Données invalides : " +
          validatedFields.error.errors.map((e) => e.message).join(", "),
      };
    }

    const { name, level, venueLatitude, venueLongitude, ...restData } =
      validatedFields.data;
    let slug = generateSlug(name, level);
    let isUnique = await verifySlugUniqueness(slug);
    let counter = 1;

    while (!isUnique) {
      slug = `${generateSlug(name, level)}-${counter}`;
      isUnique = await verifySlugUniqueness(slug);
      counter++;
    }

    console.log("Création de groupe : Données validées", {
      ...restData,
      name,
      level,
      venueLat: venueLatitude,
      venueLng: venueLongitude,
      slug,
      userId: session.user.id,
    });

    const product = await prisma.product.create({
      data: {
        ...restData,
        name,
        level,
        venueLat: venueLatitude,
        venueLng: venueLongitude,
        slug,
        userId: session.user.id,
      },
    });

    console.log("Création de groupe : Succès", product);

    revalidatePath("/products");
    return { data: product };
  } catch (error) {
    console.error("Création de groupe : Erreur", error);
    return {
      serverError:
        error instanceof Error
          ? `Erreur lors de la création du groupe : ${error.message}`
          : "Erreur lors de la création du groupe",
    };
  }
}

export async function updateProductAction({
  id,
  data,
}: {
  id: string;
  data: ProductType;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { serverError: "Vous devez être connecté pour modifier un groupe" };
  }

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    return { serverError: "Groupe introuvable" };
  }

  if (product.userId !== session.user.id) {
    return { serverError: "Vous n'êtes pas autorisé à modifier ce groupe" };
  }

  const validatedFields = ProductSchema.safeParse(data);

  if (!validatedFields.success) {
    return { serverError: "Données invalides" };
  }

  const { name, level, venueLatitude, venueLongitude, ...restData } =
    validatedFields.data;
  let slug = generateSlug(name, level);

  if (slug !== product.slug) {
    let isUnique = await verifySlugUniqueness(slug);
    let counter = 1;

    while (!isUnique) {
      slug = `${generateSlug(name, level)}-${counter}`;
      isUnique = await verifySlugUniqueness(slug);
      counter++;
    }
  }

  try {
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...restData,
        name,
        level,
        venueLat: venueLatitude,
        venueLng: venueLongitude,
        slug,
      },
    });

    revalidatePath("/products");
    revalidatePath(`/products/${id}`);
    return { data: updatedProduct };
  } catch (error) {
    return { serverError: "Erreur lors de la modification du groupe" };
  }
}

export async function leaveGroupAction({
  productId,
  userId,
}: {
  productId: string;
  userId: string;
}): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { serverError: "Vous devez être connecté pour quitter un groupe" };
  }

  if (session.user.id !== userId) {
    return { serverError: "Vous n'êtes pas autorisé à effectuer cette action" };
  }

  try {
    await prisma.membership.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    revalidatePath(`/products/${productId}`);
    return { success: true };
  } catch (error) {
    return { serverError: "Erreur lors de la suppression du membre" };
  }
}

export async function deleteProductAction(
  productId: string
): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { serverError: "Vous devez être connecté pour supprimer un groupe" };
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    return { serverError: "Groupe introuvable" };
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  });

  if (!currentUser?.isAdmin && product.userId !== session.user.id) {
    return { serverError: "Vous n'êtes pas autorisé à supprimer ce groupe" };
  }

  try {
    await prisma.product.delete({
      where: { id: productId },
    });

    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    return { serverError: "Erreur lors de la suppression du groupe" };
  }
}

export async function createMembershipAction({
  productId,
  comment,
}: {
  productId: string;
  comment?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { serverError: "Vous devez être connecté pour rejoindre un groupe" };
  }

  try {
    await prisma.membership.create({
      data: {
        productId,
        userId: session.user.id,
        comment,
        status: "PENDING",
      },
    });

    revalidatePath(`/products/${productId}`);
    return { success: true };
  } catch (error) {
    return { serverError: "Erreur lors de la création de la demande" };
  }
}

export const acceptMembershipAction = userAction(
  z.object({
    productId: z.string(),
    userId: z.string(),
  }),
  async ({ productId, userId }, { user }) => {
    if (!user) {
      return {
        serverError: "Vous devez être connecté pour effectuer cette action",
      };
    }

    try {
      // Vérifier si le produit existe
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return { serverError: "Ce groupe n'existe pas" };
      }

      // Vérifier si l'utilisateur est le propriétaire du produit
      if (product.userId !== user.id && !user.isAdmin) {
        return {
          serverError: "Vous n'êtes pas autorisé à effectuer cette action",
        };
      }

      // Mettre à jour le statut d'adhésion
      const updatedMembership = await prisma.membership.update({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
        data: {
          status: "APPROVED",
        },
        include: {
          user: true,
        },
      });

      // Créer un message système pour annoncer le nouveau membre
      if (updatedMembership && updatedMembership.user.name) {
        await prisma.message.create({
          data: {
            text: `👋 ${updatedMembership.user.name} a rejoint le groupe !`,
            productId,
            userId: product.userId, // Le message est "envoyé" par le propriétaire
          },
        });
      }

      revalidatePath(`/products/${productId}`);
      return { success: true };
    } catch (error) {
      console.error(
        "Erreur lors de l'acceptation de la demande d'adhésion:",
        error
      );
      return {
        serverError:
          error instanceof Error ? error.message : "Une erreur est survenue",
      };
    }
  }
);

export const refuseMembershipAction = userAction(
  z.object({
    productId: z.string(),
    userId: z.string(),
  }),
  async ({ productId, userId }, { user }) => {
    if (!user) {
      return {
        serverError: "Vous devez être connecté pour effectuer cette action",
      };
    }

    try {
      // Vérifier si le produit existe
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return { serverError: "Ce groupe n'existe pas" };
      }

      // Vérifier si l'utilisateur est le propriétaire du produit
      if (product.userId !== user.id && !user.isAdmin) {
        return {
          serverError: "Vous n'êtes pas autorisé à effectuer cette action",
        };
      }

      // Supprimer l'adhésion
      await prisma.membership.delete({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });

      revalidatePath(`/products/${productId}`);
      return { success: true };
    } catch (error) {
      console.error("Erreur lors du refus de la demande d'adhésion:", error);
      return {
        serverError:
          error instanceof Error ? error.message : "Une erreur est survenue",
      };
    }
  }
);

export async function removeMemberAction(
  membershipId: string
): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { serverError: "Vous devez être connecté pour retirer un membre" };
  }

  try {
    const membership = await prisma.membership.findUnique({
      where: { id: membershipId },
      include: {
        product: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!membership) {
      return { serverError: "Membre introuvable" };
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    });

    // Vérifier si l'utilisateur est le propriétaire du groupe ou un admin
    if (
      !currentUser?.isAdmin &&
      membership.product.userId !== session.user.id
    ) {
      return { serverError: "Vous n'êtes pas autorisé à retirer ce membre" };
    }

    // Mettre à jour le statut du membre
    await prisma.membership.update({
      where: { id: membershipId },
      data: {
        status: "REMOVED",
      },
    });

    // Créer un message système pour annoncer le retrait du membre
    await prisma.message.create({
      data: {
        productId: membership.productId,
        userId: session.user.id,
        text: `👋 ${membership.user.name} a été retiré du groupe.`,
      },
    });

    revalidatePath(`/products/${membership.productId}`);
    return { success: true };
  } catch (error) {
    console.error("Erreur lors du retrait du membre:", error);
    return { serverError: "Erreur lors du retrait du membre" };
  }
}

export const sendMessageAction = userAction(
  z.object({
    productId: z.string(),
    text: z.string(),
    replyToId: z.string().optional(),
  }),
  async ({ productId, text, replyToId }, { user }) => {
    if (!user) {
      return {
        serverError: "Vous devez être connecté pour envoyer un message",
      };
    }

    try {
      // Vérifier si le produit existe
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          memberships: {
            where: { userId: user.id, status: "APPROVED" },
          },
        },
      });

      if (!product) {
        return { serverError: "Ce produit n'existe pas" };
      }

      // Vérifier si l'utilisateur est membre ou propriétaire
      const isMember = product.memberships.length > 0;
      const isOwner = product.userId === user.id;

      if (!isMember && !isOwner && !user.isAdmin) {
        return {
          serverError:
            "Vous n'êtes pas autorisé à envoyer des messages dans ce groupe",
        };
      }

      // Créer le message
      await prisma.message.create({
        data: {
          text,
          productId,
          userId: user.id,
          ...(replyToId ? { replyToId } : {}),
        },
      });

      // Marquer les messages comme lus pour l'expéditeur
      await prisma.unreadMessage.deleteMany({
        where: {
          userId: user.id,
          message: {
            productId,
          },
        },
      });

      // Créer des notifications pour les autres membres
      const members = await prisma.membership.findMany({
        where: {
          productId,
          userId: { not: user.id },
          status: "APPROVED",
        },
        select: { userId: true },
      });

      const message = await prisma.message.findFirst({
        where: {
          productId,
          userId: user.id,
        },
        orderBy: { createdAt: "desc" },
      });

      if (message) {
        await prisma.unreadMessage.createMany({
          data: members.map((member) => ({
            userId: member.userId,
            messageId: message.id,
          })),
          skipDuplicates: true,
        });
      }

      revalidatePath(`/products/${productId}`);
      return { success: true };
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      return {
        serverError:
          error instanceof Error ? error.message : "Une erreur est survenue",
      };
    }
  }
);

export const deleteMessageAction = userAction(
  z.object({
    messageId: z.string(),
  }),
  async ({ messageId }, { user }) => {
    if (!user) {
      return {
        serverError: "Vous devez être connecté pour supprimer un message",
      };
    }

    try {
      // Vérifier si le message existe
      const message = await prisma.message.findUnique({
        where: { id: messageId },
        include: {
          product: true,
        },
      });

      if (!message) {
        return { serverError: "Ce message n'existe pas" };
      }

      // Vérifier si l'utilisateur est l'auteur du message ou le propriétaire du produit
      const isAuthor = message.userId === user.id;
      const isProductOwner = message.product.userId === user.id;
      const isAdmin = user.isAdmin;

      if (!isAuthor && !isProductOwner && !isAdmin) {
        return {
          serverError: "Vous n'êtes pas autorisé à supprimer ce message",
        };
      }

      // Supprimer le message
      await prisma.message.update({
        where: { id: messageId },
        data: { isDeleted: true },
      });

      // Supprimer les notifications associées
      await prisma.unreadMessage.deleteMany({
        where: { messageId },
      });

      revalidatePath(`/products/${message.productId}`);
      return { success: true };
    } catch (error) {
      console.error("Erreur lors de la suppression du message:", error);
      return {
        serverError:
          error instanceof Error ? error.message : "Une erreur est survenue",
      };
    }
  }
);
