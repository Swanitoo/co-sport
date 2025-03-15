import { requiredCurrentUser } from "@/auth/current-user";
import { prisma } from "@/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await requiredCurrentUser();

    // Vérifier si l'utilisateur est administrateur
    if (!user.isAdmin) {
      return NextResponse.json(
        { error: "Vous n'avez pas les droits d'administrateur" },
        { status: 403 }
      );
    }

    // Récupérer tous les tickets parents avec leurs réponses
    const tickets = await prisma.supportTicket.findMany({
      where: {
        parentId: null, // Uniquement les tickets parents
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                isAdmin: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transformer les données pour maintenir la compatibilité avec le frontend
    const formattedTickets = tickets.map((ticket) => {
      // Transformer les réponses
      const responses =
        ticket.replies?.map((reply: any) => ({
          id: reply.id,
          type: reply.isAdmin ? "admin" : "user",
          response: reply.message,
          createdAt: reply.createdAt,
          author:
            reply.user?.name ||
            (reply.isAdmin ? "Administrateur" : "Utilisateur"),
        })) || [];

      return {
        id: ticket.id,
        subject: ticket.subject || "",
        message: ticket.message,
        createdAt: ticket.createdAt,
        isResolved: ticket.isResolved,
        userId: ticket.userId,
        user: ticket.user,
        responses: responses,
      };
    });

    return NextResponse.json(formattedTickets);
  } catch (error) {
    console.error("Erreur lors de la récupération des tickets:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des tickets" },
      { status: 500 }
    );
  }
}
