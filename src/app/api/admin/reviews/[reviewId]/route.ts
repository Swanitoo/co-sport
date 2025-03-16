import { requiredCurrentUser } from "@/auth/current-user";
import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const user = await requiredCurrentUser();

    // Vérifier si l'utilisateur est administrateur
    if (!user.isAdmin) {
      return NextResponse.json(
        { error: "Vous n'avez pas les droits d'administrateur" },
        { status: 403 }
      );
    }

    const { reviewId } = params;

    // Vérifier que l'avis existe
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json({ error: "Avis non trouvé" }, { status: 404 });
    }

    // Supprimer l'avis
    await prisma.review.delete({
      where: { id: reviewId },
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
