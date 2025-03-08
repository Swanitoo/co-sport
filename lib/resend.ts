import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  throw new Error("RESEND_API_KEY is not defined");
}

export const resend = new Resend(resendApiKey);

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
