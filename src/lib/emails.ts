import JoinRequestEmail from "../../emails/JoinRequestEmail";
import MembershipAcceptedEmail from "../../emails/MembershipAcceptedEmail";
import NewMessageEmail from "../../emails/NewMessageEmail";
import ProductCreatedEmail from "../../emails/ProductCreatedEmail";
import WelcomeEmail from "../../emails/WelcomeEmail";
import { sendEmail } from "./resend";

export const sendWelcomeEmail = async (email: string, name: string) => {
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
}: {
  email: string;
  productName: string;
  productId: string;
  isFirstProduct?: boolean;
  slug?: string;
}) => {
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
  userName: string
) => {
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
  messageCount: number = 1
) => {
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
  productId: string
) => {
  return sendEmail({
    email,
    subject: `Votre demande d'adhésion à ${productName} a été acceptée !`,
    react: MembershipAcceptedEmail({
      productName,
      productId,
    }),
  });
};
