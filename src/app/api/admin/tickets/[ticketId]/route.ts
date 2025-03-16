import { requiredCurrentUser } from "@/auth/current-user";
import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { ticketId: string } }
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

    const { ticketId } = params;

    // Vérifier que le ticket existe
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket non trouvé" }, { status: 404 });
    }

    // Supprimer d'abord toutes les réponses associées au ticket
    await prisma.supportTicket.deleteMany({
      where: { parentId: ticketId },
    });

    // Puis supprimer le ticket principal
    await prisma.supportTicket.delete({
      where: { id: ticketId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression du ticket:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du ticket" },
      { status: 500 }
    );
  }
}
