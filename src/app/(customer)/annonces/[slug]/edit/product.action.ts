"use server";

import { auth } from "@/auth/auth";
import {
  sendJoinRequestEmail,
  sendMembershipAcceptedEmail,
  sendNewMessageEmail,
  sendProductCreatedEmail,
} from "@/lib/emails";
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

    // Envoyer un email de confirmation
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (user?.email) {
      const isFirstProduct = user._count.products <= 1;
      await sendProductCreatedEmail({
        email: user.email,
        productName: name,
        productId: product.id,
        isFirstProduct,
        slug: product.slug,
        userId: session.user.id,
      });
    }

    // Revalider les chemins pour toutes les locales
    revalidatePath("/annonces");
    revalidatePath("/en/annonces");
    revalidatePath("/fr/annonces");
    revalidatePath("/es/annonces");
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

  // Vérifier si l'utilisateur est un administrateur
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  });

  // Permettre aux admins de modifier n'importe quelle annonce
  if (product.userId !== session.user.id && !user?.isAdmin) {
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

    // Revalider les chemins pour toutes les locales
    revalidatePath("/annonces");
    revalidatePath("/en/annonces");
    revalidatePath("/fr/annonces");
    revalidatePath("/es/annonces");
    revalidatePath(`/annonces/${id}`);
    revalidatePath(`/annonces/${slug}`);
    revalidatePath(`/en/annonces/${id}`);
    revalidatePath(`/en/annonces/${slug}`);
    revalidatePath(`/fr/annonces/${id}`);
    revalidatePath(`/fr/annonces/${slug}`);
    revalidatePath(`/es/annonces/${id}`);
    revalidatePath(`/es/annonces/${slug}`);
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

    // Revalider les chemins pour toutes les locales
    revalidatePath(`/annonces/${productId}`);
    revalidatePath(`/en/annonces/${productId}`);
    revalidatePath(`/fr/annonces/${productId}`);
    revalidatePath(`/es/annonces/${productId}`);
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

    // Revalider les chemins pour toutes les locales
    revalidatePath("/annonces");
    revalidatePath("/en/annonces");
    revalidatePath("/fr/annonces");
    revalidatePath("/es/annonces");
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
    // Récupérer les informations du produit et de l'utilisateur
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        user: {
          select: {
            email: true,
            id: true,
          },
        },
      },
    });

    if (!product) {
      return { serverError: "Ce groupe n'existe pas" };
    }

    // Récupérer les informations de l'utilisateur qui fait la demande
    const requestingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    });

    await prisma.membership.create({
      data: {
        productId,
        userId: session.user.id,
        comment,
        status: "PENDING",
      },
    });

    // Envoyer un email au propriétaire du groupe
    if (product.user.email && requestingUser?.name) {
      await sendJoinRequestEmail(
        product.user.email,
        product.name,
        productId,
        requestingUser.name,
        product.user.id,
        product.slug
      );
    }

    revalidatePath(`/annonces/${productId}`);
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

        // Envoyer un email à l'utilisateur pour l'informer que sa demande a été acceptée
        if (updatedMembership.user.email) {
          await sendMembershipAcceptedEmail(
            updatedMembership.user.email,
            product.name,
            productId,
            userId,
            product.slug
          );
        }
      }

      revalidatePath(`/annonces/${productId}`);
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

      revalidatePath(`/annonces/${productId}`);
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

    revalidatePath(`/annonces/${membership.productId}`);
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

      // Si le propriétaire n'est pas l'expéditeur, l'ajouter aux membres pour notification
      if (product.userId !== user.id) {
        members.push({ userId: product.userId });
      }

      const message = await prisma.message.findFirst({
        where: {
          productId,
          userId: user.id,
        },
        orderBy: { createdAt: "desc" },
      });

      if (message) {
        // Créer les notifications dans la base de données
        await prisma.unreadMessage.createMany({
          data: members.map((member) => ({
            userId: member.userId,
            messageId: message.id,
          })),
          skipDuplicates: true,
        });

        // Récupérer les informations sur les destinataires pour les emails
        const recipients = await prisma.user.findMany({
          where: {
            id: {
              in: members.map((member) => member.userId),
            },
          },
          select: { id: true, email: true },
        });

        // Récupérer les détails du produit
        const productDetails = await prisma.product.findUnique({
          where: { id: productId },
          select: { name: true, slug: true },
        });

        // Récupérer les informations de l'expéditeur
        const sender = await prisma.user.findUnique({
          where: { id: user.id },
          select: { name: true },
        });

        // Envoyer un email à chaque destinataire
        for (const recipient of recipients) {
          if (recipient.email) {
            await sendNewMessageEmail(
              recipient.email,
              productDetails?.name || "Activité",
              productId,
              sender?.name || "Un utilisateur",
              text,
              1,
              recipient.id,
              productDetails?.slug
            );
          }
        }
      }

      revalidatePath(`/annonces/${productId}`);
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

      revalidatePath(`/annonces/${message.productId}`);
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
