import { requiredCurrentUser } from "@/auth/current-user";
import { prisma } from "@/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Vérifier que l'utilisateur est connecté
    const user = await requiredCurrentUser();

    // Récupérer tous les tickets de support créés par l'utilisateur (tickets parents uniquement)
    const tickets = await prisma.supportTicket.findMany({
      where: {
        userId: user.id,
        parentId: null, // Seulement les tickets parents
      },
      include: {
        replies: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transformer les données pour maintenir la compatibilité avec le composant frontend
    const formattedTickets = tickets.map((ticket) => {
      // Transformer les réponses (replies) au format attendu par le frontend
      const responses =
        ticket.replies?.map((reply: any) => ({
          id: reply.id,
          response: reply.message,
          createdAt: reply.createdAt,
          isAdmin: reply.isAdmin,
          author: reply.isAdmin
            ? reply.user?.name || "Administrateur"
            : reply.user?.name || "Vous",
        })) || [];

      return {
        id: ticket.id,
        subject: ticket.subject || "",
        message: ticket.message,
        createdAt: ticket.createdAt,
        isResolved: ticket.isResolved,
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
