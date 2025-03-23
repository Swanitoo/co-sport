import { auth } from "@/auth/auth";
import { prisma } from "@/prisma";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { showBadges } = await request.json();

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { showBadges },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des paramètres", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
