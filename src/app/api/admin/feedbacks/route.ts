import { requiredCurrentUser } from "@/auth/current-user";
import { prisma } from "@/prisma";
import { NextResponse } from "next/server";

// Indique à Next.js que cette route est dynamique et ne doit pas être générée statiquement
export const dynamic = "force-dynamic";

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

    // Récupérer tous les avis avec les informations de l'utilisateur
    const feedbacks = await prisma.feedback.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error("Erreur lors de la récupération des avis:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des avis" },
      { status: 500 }
    );
  }
}
