import { requiredCurrentUser } from "@/auth/current-user";
import { prisma } from "@/prisma";
import { NextResponse } from "next/server";

// Indique à Next.js que cette route est dynamique et ne doit pas être générée statiquement
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requiredCurrentUser();

    // Récupérer le feedback existant de l'utilisateur
    const feedback = await prisma.feedback.findFirst({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        rating: true,
        feedback: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Erreur lors de la récupération du feedback:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du feedback" },
      { status: 500 }
    );
  }
}
