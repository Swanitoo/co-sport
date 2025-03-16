"use server";

import { requiredCurrentUser } from "@/auth/current-user";
import { sendSupportResponseEmail } from "@/lib/emails";
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

  // Récupérer les informations du ticket et de l'utilisateur
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!ticket || !ticket.user || !ticket.user.email) {
    throw new Error("Ticket ou utilisateur introuvable");
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
      where: { id: ticketId },
      data: { isResolved: true },
    });
  }

  // Envoyer un email à l'utilisateur
  try {
    const { success } = await sendSupportResponseEmail({
      email: ticket.user.email,
      userName: ticket.user.name || "Utilisateur",
      subject: ticket.subject || "Votre demande",
      originalMessage: ticket.message,
      adminResponse: response,
      userId: ticket.user.id,
    });

    if (!success) {
      console.error("Échec de l'envoi de l'email de réponse au support");
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de réponse:", error);
    // On continue malgré l'erreur d'envoi d'email
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

/**
 * Action serveur pour supprimer un ticket de support et toutes ses réponses.
 * Seuls les administrateurs peuvent effectuer cette action.
 */
export async function deleteTicket(ticketId: string) {
  const user = await requiredCurrentUser();
  if (!user.isAdmin) {
    throw new Error("Seuls les administrateurs peuvent effectuer cette action");
  }

  try {
    // Supprimer d'abord toutes les réponses associées au ticket
    await prisma.supportTicket.deleteMany({
      where: { parentId: ticketId },
    });

    // Puis supprimer le ticket principal
    await prisma.supportTicket.delete({
      where: { id: ticketId },
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression du ticket:", error);
    throw new Error("Erreur lors de la suppression du ticket");
  }
}

/**
 * Action serveur pour supprimer un avis.
 * Seuls les administrateurs peuvent effectuer cette action.
 */
export async function deleteFeedback(feedbackId: string) {
  const user = await requiredCurrentUser();
  if (!user.isAdmin) {
    throw new Error("Seuls les administrateurs peuvent effectuer cette action");
  }

  try {
    await prisma.feedback.delete({
      where: { id: feedbackId },
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression de l'avis:", error);
    throw new Error("Erreur lors de la suppression de l'avis");
  }
}
