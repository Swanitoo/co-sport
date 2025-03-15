import { prisma } from "@/prisma";
import JoinRequestEmail from "../../emails/JoinRequestEmail";
import MembershipAcceptedEmail from "../../emails/MembershipAcceptedEmail";
import NewMessageEmail from "../../emails/NewMessageEmail";
import ProductCreatedEmail from "../../emails/ProductCreatedEmail";
import ReviewReceivedEmail from "../../emails/ReviewReceivedEmail";
import SupportResponseEmail from "../../emails/SupportResponseEmail";
import WelcomeEmail from "../../emails/WelcomeEmail";
import { sendEmail } from "./resend";

// Vérifier les préférences d'email d'un utilisateur
async function checkEmailPreference(
  userId: string,
  preferenceType: keyof Omit<
    NonNullable<Awaited<ReturnType<typeof prisma.emailPreference.findUnique>>>,
    "id" | "createdAt" | "updatedAt" | "userId" | "user"
  >
): Promise<boolean> {
  // Si aucun ID utilisateur n'est fourni, on envoie l'email par défaut
  if (!userId) return true;

  try {
    const preferences = await prisma.emailPreference.findUnique({
      where: { userId },
    });

    // Si pas de préférences, on envoie l'email par défaut
    if (!preferences) return true;

    // Retourner la préférence spécifique
    return preferences[preferenceType];
  } catch (error) {
    console.error(
      `Erreur lors de la vérification des préférences email (${preferenceType}):`,
      error
    );
    // En cas d'erreur, on envoie l'email par défaut
    return true;
  }
}

export const sendWelcomeEmail = async (email: string, name: string) => {
  // Email de bienvenue est toujours envoyé
  return sendEmail({
    email,
    subject: "Bienvenue sur Co-Sport !",
    react: WelcomeEmail({ name }),
  });
};

export const sendProductCreatedEmail = async ({
  email,
  productName,
  productId,
  isFirstProduct = false,
  slug,
  userId,
}: {
  email: string;
  productName: string;
  productId: string;
  isFirstProduct?: boolean;
  slug?: string;
  userId?: string;
}) => {
  // Email de création de produit est considéré comme un email marketing
  if (userId) {
    const shouldSend = await checkEmailPreference(userId, "marketingEmails");
    if (!shouldSend) return { success: false, skipped: true };
  }

  return sendEmail({
    email,
    subject: isFirstProduct
      ? "Votre première annonce a été créée !"
      : "Votre annonce a été créée !",
    react: ProductCreatedEmail({
      productName,
      productId,
      isFirstProduct,
      slug,
    }),
  });
};

export const sendJoinRequestEmail = async (
  email: string,
  productName: string,
  productId: string,
  userName: string,
  userId?: string
) => {
  // Vérifier les préférences pour les demandes d'adhésion
  if (userId) {
    const shouldSend = await checkEmailPreference(userId, "joinRequestEmails");
    if (!shouldSend) return { success: false, skipped: true };
  }

  return sendEmail({
    email,
    subject: "Nouvelle demande d'adhésion !",
    react: JoinRequestEmail({ productName, productId, userName }),
  });
};

export const sendNewMessageEmail = async (
  email: string,
  productName: string,
  productId: string,
  senderName: string,
  messagePreview: string,
  messageCount: number = 1,
  userId?: string
) => {
  // Vérifier les préférences pour les nouveaux messages
  if (userId) {
    const shouldSend = await checkEmailPreference(userId, "newMessagesEmails");
    if (!shouldSend) return { success: false, skipped: true };
  }

  const subject =
    messageCount > 1
      ? `${messageCount} nouveaux messages dans ${productName}`
      : `Nouveau message de ${senderName} dans ${productName}`;

  return sendEmail({
    email,
    subject,
    react: NewMessageEmail({
      productName,
      productId,
      senderName,
      messagePreview,
      messageCount,
    }),
  });
};

export const sendMembershipAcceptedEmail = async (
  email: string,
  productName: string,
  productId: string,
  userId?: string
) => {
  // Vérifier les préférences pour les adhésions acceptées
  if (userId) {
    const shouldSend = await checkEmailPreference(userId, "membershipEmails");
    if (!shouldSend) return { success: false, skipped: true };
  }

  return sendEmail({
    email,
    subject: `Votre demande d'adhésion à ${productName} a été acceptée !`,
    react: MembershipAcceptedEmail({
      productName,
      productId,
    }),
  });
};

export const sendReviewReceivedEmail = async ({
  email,
  productName,
  productId,
  reviewerName,
  rating,
  reviewText,
  userId,
}: {
  email: string;
  productName: string;
  productId: string;
  reviewerName: string;
  rating: number;
  reviewText: string;
  userId?: string;
}) => {
  // Vérifier les préférences pour les avis
  if (userId) {
    const shouldSend = await checkEmailPreference(userId, "reviewEmails");
    if (!shouldSend) return { success: false, skipped: true };
  }

  return sendEmail({
    email,
    subject: `Nouvel avis sur votre activité ${productName}`,
    react: ReviewReceivedEmail({
      productName,
      productId,
      reviewerName,
      rating,
      reviewText,
    }),
  });
};

export const sendSupportResponseEmail = async ({
  email,
  userName,
  subject,
  originalMessage,
  adminResponse,
  userId,
}: {
  email: string;
  userName: string;
  subject: string;
  originalMessage: string;
  adminResponse: string;
  userId?: string;
}) => {
  // Toujours envoyer les réponses de support, indépendamment des préférences
  return sendEmail({
    email,
    subject: `Réponse à votre demande : ${subject}`,
    react: SupportResponseEmail({
      userName,
      subject,
      originalMessage,
      adminResponse,
    }),
  });
};
