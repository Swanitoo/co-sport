import { requiredCurrentUser } from "@/auth/current-user";
import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

// Indique à Next.js que cette route est dynamique et ne doit pas être générée statiquement
export const dynamic = "force-dynamic";

/**
 * Endpoint pour supprimer un avis
 * Accessible uniquement aux administrateurs
 */
export async function DELETE(request: NextRequest, props: { params: Promise<{ feedbackId: string }> }) {
  const params = await props.params;
  try {
    const user = await requiredCurrentUser();

    // Vérifier si l'utilisateur est administrateur
    if (!user.isAdmin) {
      return NextResponse.json(
        { error: "Vous n'avez pas les droits d'administrateur" },
        { status: 403 }
      );
    }

    const feedbackId = params.feedbackId;

    // Vérifier si l'avis existe
    const feedback = await prisma.feedback.findUnique({
      where: { id: feedbackId },
    });

    if (!feedback) {
      return NextResponse.json({ error: "Avis non trouvé" }, { status: 404 });
    }

    // Supprimer l'avis
    await prisma.feedback.delete({
      where: { id: feedbackId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'avis:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'avis" },
      { status: 500 }
    );
  }
}
