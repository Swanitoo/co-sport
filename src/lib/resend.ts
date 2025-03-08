import { env } from "@/env";
import { Resend } from "resend";

export const resend = new Resend(env.RESEND_API_KEY);

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
