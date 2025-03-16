"use server";

import { prisma } from "@/prisma";

export async function updateEmailPreferences(formData: FormData) {
  const userId = formData.get("userId") as string;

  // Récupérer les valeurs des cases à cocher
  const marketingEmails = formData.get("marketingEmails") === "on";
  const newMessagesEmails = formData.get("newMessagesEmails") === "on";
  const joinRequestEmails = formData.get("joinRequestEmails") === "on";
  const membershipEmails = formData.get("membershipEmails") === "on";
  const reviewEmails = formData.get("reviewEmails") === "on";

  try {
    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { emailPreferences: true },
    });

    if (!user) {
      console.error("Utilisateur non trouvé:", userId);
      return { success: false, error: "Utilisateur non trouvé" };
    }

    // Si l'utilisateur a déjà des préférences, les mettre à jour
    if (user.emailPreferences) {
      await prisma.emailPreference.update({
        where: { id: user.emailPreferences.id },
        data: {
          marketingEmails,
          newMessagesEmails,
          joinRequestEmails,
          membershipEmails,
          reviewEmails,
        },
      });
    } else {
      // Sinon, créer de nouvelles préférences
      await prisma.emailPreference.create({
        data: {
          userId,
          marketingEmails,
          newMessagesEmails,
          joinRequestEmails,
          membershipEmails,
          reviewEmails,
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour des préférences d'email:",
      error
    );

    // En cas d'erreur, essayer une approche alternative via l'utilisateur
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          emailPreferences: {
            upsert: {
              create: {
                marketingEmails,
                newMessagesEmails,
                joinRequestEmails,
                membershipEmails,
                reviewEmails,
              },
              update: {
                marketingEmails,
                newMessagesEmails,
                joinRequestEmails,
                membershipEmails,
                reviewEmails,
              },
            },
          },
        },
      });

      return { success: true };
    } catch (secondError) {
      console.error(
        "Erreur secondaire lors de la mise à jour des préférences:",
        secondError
      );
      return {
        success: false,
        error: "Erreur lors de la mise à jour des préférences",
      };
    }
  }
}
