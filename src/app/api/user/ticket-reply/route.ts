import { requiredCurrentUser } from "@/auth/current-user";
import { prisma } from "@/prisma";
import { NextResponse } from "next/server";

// Indique à Next.js que cette route est dynamique et ne doit pas être générée statiquement
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await requiredCurrentUser();
    const { ticketId, message } = await request.json();

    // Vérifier que le ticket existe et appartient à l'utilisateur
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id: ticketId,
        userId: user.id,
        parentId: null, // C'est un ticket parent
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket introuvable ou non autorisé" },
        { status: 404 }
      );
    }

    // Créer une nouvelle réponse (un ticket enfant)
    await prisma.supportTicket.create({
      data: {
        parentId: ticketId,
        userId: user.id,
        message: message,
        isAdmin: false,
      },
    });

    // Si le ticket était marqué comme résolu, le marquer comme non résolu
    if (ticket.isResolved) {
      await prisma.supportTicket.update({
        where: {
          id: ticketId,
        },
        data: {
          isResolved: false,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de l'envoi de la réponse:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de la réponse" },
      { status: 500 }
    );
  }
}
