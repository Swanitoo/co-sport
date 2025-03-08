import { auth } from "@/auth/auth";
import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      );
    }

    const { text, productId, replyToId } = await req.json();

    // Vérifier si le texte est valide
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Le message ne peut pas être vide" },
        { status: 400 }
      );
    }

    // Vérifier si l'ID du produit est valide
    if (!productId || typeof productId !== "string") {
      return NextResponse.json(
        { error: "ID de produit invalide" },
        { status: 400 }
      );
    }

    // Vérifier si le texte est trop long
    if (text.length > 1000) {
      return NextResponse.json(
        { error: "Le message est trop long (1000 caractères maximum)" },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur a accès au produit
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        memberships: {
          where: { userId: session.user.id, status: "APPROVED" },
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

    // Vérifier le message auquel on répond
    if (replyToId) {
      const replyMessage = await prisma.message.findUnique({
        where: { id: replyToId, productId },
      });

      if (!replyMessage) {
        return NextResponse.json(
          { error: "Message de réponse non trouvé" },
          { status: 404 }
        );
      }
    }

    // Créer le message
    const message = await prisma.message.create({
      data: {
        text,
        userId: session.user.id,
        productId,
        replyToId,
      },
      include: {
        user: {
          select: {
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

    // Récupérer tous les utilisateurs du produit sauf l'expéditeur
    const members = await prisma.membership.findMany({
      where: {
        productId,
        status: "APPROVED",
        userId: {
          not: session.user.id,
        },
      },
      select: {
        userId: true,
      },
    });

    // Inclure l'administrateur s'il n'est pas l'expéditeur
    if (product.userId !== session.user.id) {
      members.push({ userId: product.userId });
    }

    // Version simplifiée: on crée des notifications pour tous les utilisateurs
    // sauf l'expéditeur qui est déjà dans la conversation
    // Note: Une solution plus complète nécessiterait de suivre les utilisateurs
    // qui sont actuellement actifs dans la conversation spécifique
    const notificationsToCreate = members.map((member) => ({
      userId: member.userId,
      messageId: message.id,
    }));

    if (notificationsToCreate.length > 0) {
      await prisma.unreadMessage.createMany({
        data: notificationsToCreate,
      });
    }

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du message" },
      { status: 500 }
    );
  }
}
