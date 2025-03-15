"use server";

import { prisma } from "@/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function saveEmailPreferences(formData: FormData) {
  const userId = formData.get("userId") as string;

  // Valider l'ID utilisateur
  if (!userId) {
    throw new Error("User ID is required");
  }

  // Récupérer les valeurs des checkbox (ils sont présents seulement s'ils sont cochés)
  const marketingEmails = formData.has("marketingEmails");
  const newMessagesEmails = formData.has("newMessagesEmails");
  const joinRequestEmails = formData.has("joinRequestEmails");
  const membershipEmails = formData.has("membershipEmails");
  const reviewEmails = formData.has("reviewEmails");

  try {
    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Mettre à jour ou créer les préférences d'email
    await prisma.emailPreference.upsert({
      where: { userId },
      update: {
        marketingEmails,
        newMessagesEmails,
        joinRequestEmails,
        membershipEmails,
        reviewEmails,
      },
      create: {
        userId,
        marketingEmails,
        newMessagesEmails,
        joinRequestEmails,
        membershipEmails,
        reviewEmails,
      },
    });

    // Revalider la page pour refléter les changements
    revalidatePath("/profile/email-preferences");

    // Rediriger avec un message de succès
    redirect("/profile/email-preferences?success=true");
  } catch (error) {
    console.error("Error saving email preferences:", error);
    redirect("/profile/email-preferences?error=true");
  }
}
