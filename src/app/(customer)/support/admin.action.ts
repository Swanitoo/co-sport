"use server";

import { requiredCurrentUser } from "@/auth/current-user";
import { prisma } from "@/prisma";

/**
 * Action serveur pour marquer un ticket de support comme résolu.
 * Seuls les administrateurs peuvent effectuer cette action.
 */
export async function markContactAsResolved(messageId: string) {
  const user = await requiredCurrentUser();
  if (!user.isAdmin) {
    throw new Error("Seuls les administrateurs peuvent effectuer cette action");
  }

  await prisma.supportTicket.update({
    where: {
      id: messageId,
    },
    data: {
      isResolved: true,
    },
  });
}

/**
 * Action serveur pour répondre à un ticket de support.
 * Seuls les administrateurs peuvent effectuer cette action.
 */
export async function replyToContactMessage(
  ticketId: string,
  response: string,
  markAsResolved = false
) {
  const user = await requiredCurrentUser();
  if (!user.isAdmin) {
    throw new Error("Seuls les administrateurs peuvent effectuer cette action");
  }

  // Créer une réponse à ce ticket (un ticket enfant)
  await prisma.supportTicket.create({
    data: {
      parentId: ticketId,
      message: response,
      userId: user.id,
      isAdmin: true,
    },
  });

  // Marquer le ticket comme résolu seulement si demandé
  if (markAsResolved) {
    await prisma.supportTicket.update({
      where: {
        id: ticketId,
      },
      data: {
        isResolved: true,
      },
    });
  }
}

/**
 * Action serveur pour modifier un avis.
 * Seuls les administrateurs peuvent effectuer cette action.
 */
export async function updateFeedback(
  feedbackId: string,
  data: { rating?: number; feedback?: string }
) {
  const user = await requiredCurrentUser();
  if (!user.isAdmin) {
    throw new Error("Seuls les administrateurs peuvent effectuer cette action");
  }

  return prisma.feedback.update({
    where: {
      id: feedbackId,
    },
    data: {
      rating: data.rating,
      feedback: data.feedback,
    },
  });
}

// Récupérer les réponses utilisateur pour un ticket spécifique
export async function getUserResponsesForMessage(ticketId: string) {
  const user = await requiredCurrentUser();
  if (!user.isAdmin) {
    throw new Error("Seuls les administrateurs peuvent effectuer cette action");
  }

  return prisma.supportTicket.findMany({
    where: {
      parentId: ticketId,
      isAdmin: false,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}
