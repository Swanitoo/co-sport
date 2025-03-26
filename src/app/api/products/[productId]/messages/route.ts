import { auth } from "@/auth/auth";
import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, props: { params: Promise<{ productId: string }> }) {
  const params = await props.params;
  try {
    // Récupérer la session de l'utilisateur
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      );
    }

    // Récupérer les paramètres de pagination
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // Valider les paramètres
    if (isNaN(page) || page < 1) {
      return NextResponse.json(
        { error: "Numéro de page invalide" },
        { status: 400 }
      );
    }

    if (isNaN(limit) || limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: "Limite invalide (1-50)" },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;
    const productId = params.productId;

    // Vérifier si l'utilisateur a accès au produit
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        memberships: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier si l'utilisateur est membre ou propriétaire
    const isMember = product.memberships.length > 0;
    const isOwner = product.userId === session.user.id;

    if (!isMember && !isOwner) {
      return NextResponse.json(
        { error: "Vous n'avez pas accès à ce produit" },
        { status: 403 }
      );
    }

    // Récupérer les messages avec pagination
    const messages = await prisma.message.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        replyTo: {
          select: {
            id: true,
            text: true,
            userId: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Inverser l'ordre pour avoir les messages les plus anciens en premier
    const sortedMessages = [...messages].reverse();

    return NextResponse.json({ messages: sortedMessages });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors du chargement des messages" },
      { status: 500 }
    );
  }
}
