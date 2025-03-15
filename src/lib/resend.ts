import { env } from "@/env";
import { Resend } from "resend";

export const resend = new Resend(env.RESEND_API_KEY);

// Valeurs d'environnement pour la configuration des emails
export const APP_URL =
  process.env.NODE_ENV === "production"
    ? "https://co-sport.com"
    : process.env.NEXTAUTH_URL || "http://localhost:3000";

// S'assurer que Resend et les templates d'emails connaissent l'URL de base correcte
if (typeof window === "undefined") {
  process.env.NEXT_PUBLIC_APP_URL = APP_URL;
}

export const sendEmail = async ({
  email,
  subject,
  react,
}: {
  email: string;
  subject: string;
  react: JSX.Element;
}) => {
  if (!email || !subject || !react) {
    throw new Error("Missing required parameters for sending email");
  }

  try {
    const data = await resend.emails.send({
      from: "Co-Sport <noreply@co-sport.com>",
      to: email,
      subject: subject,
      react: react,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
};
