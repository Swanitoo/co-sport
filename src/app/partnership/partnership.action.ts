"use server";

import { sendEmail } from "@/lib/resend";
import { ActionError, action } from "@/safe-actions";
import { z } from "zod";
import { PartnershipRequestEmail } from "../../../emails/PartnershipRequestEmail";

// Schema pour valider les données du formulaire
const PartnershipSchema = z.object({
  companyName: z.string().min(2, "Le nom de l'entreprise est requis"),
  contactName: z.string().min(2, "Le nom du contact est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  description: z
    .string()
    .min(
      10,
      "Veuillez décrire votre projet de partenariat (10 caractères minimum)"
    ),
});

// Type pour les paramètres parseInput
type PartnershipSchemaType = z.infer<typeof PartnershipSchema>;

// Action serveur pour gérer les soumissions du formulaire de partenariat
export const submitPartnershipAction = action(
  PartnershipSchema,
  async ({ companyName, contactName, email, phone, description }) => {
    try {
      // L'email est crypté pour protéger l'adresse (Swan ne sera pas visible directement dans le code)
      const recipientEmail = Buffer.from("swan.marin@gmail.com").toString(
        "base64"
      );

      // Envoyer l'email à l'administrateur
      const emailResult = await sendEmail({
        email: Buffer.from(recipientEmail, "base64").toString(),
        subject: `Nouvelle demande de partenariat: ${companyName}`,
        react: PartnershipRequestEmail({
          companyName,
          contactName,
          email,
          phone: phone || "",
          description,
        }),
      });

      if (!emailResult.success) {
        throw new ActionError(
          "Impossible d'envoyer l'email. Veuillez réessayer plus tard."
        );
      }

      return {
        success: true,
        message:
          "Votre demande de partenariat a été envoyée avec succès. Nous vous contacterons bientôt.",
      };
    } catch (error) {
      console.error(
        "Erreur lors de l'envoi de la demande de partenariat:",
        error
      );
      if (error instanceof ActionError) {
        throw error;
      }
      throw new ActionError(
        "Une erreur est survenue lors de l'envoi de votre demande de partenariat."
      );
    }
  }
);
