import { auth } from "@/auth/auth";
import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

// Simuler un cache d'activité des utilisateurs
// Dans une application réelle, ce serait dans Redis ou une autre solution de stockage
const userLastActiveMap = new Map<string, Date>();

// Mettre à jour ou récupérer la dernière activité d'un utilisateur
function updateUserActivity(userId: string): void {
  userLastActiveMap.set(userId, new Date());
}

function getUserLastActive(userId: string): Date | undefined {
  return userLastActiveMap.get(userId);
}

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ productId: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      );
    }

    const productId = params.productId;
    if (!productId) {
      return NextResponse.json(
        { error: "ID du produit manquant" },
        { status: 400 }
      );
    }

    // Toujours mettre à jour l'activité de l'utilisateur actuel
    updateUserActivity(session.user.id);

    // Vérifier si l'utilisateur a accès au produit
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        memberships: {
          where: { status: "APPROVED" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
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
    const currentUserId = session.user.id;
    const isMember = product.memberships.some(
      (membership) => membership.userId === currentUserId
    );
    const isOwner = product.userId === currentUserId;

    // Vérifier si l'utilisateur est admin
    const isAdmin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    });

    if (!isMember && !isOwner && !isAdmin?.isAdmin) {
      return NextResponse.json(
        { error: "Vous n'avez pas accès à ce produit" },
        { status: 403 }
      );
    }

    // Récupérer les membres et le propriétaire
    const owner = await prisma.user.findUnique({
      where: { id: product.userId },
      select: {
        id: true,
        name: true,
        image: true,
      },
    });

    // Collecter tous les membres
    const members = [
      ...(owner ? [owner] : []),
      ...product.memberships.map((membership) => membership.user),
    ];

    // Éviter les doublons et ajouter les informations d'activité
    const uniqueMembers = Array.from(
      new Map(members.map((item) => [item.id, item])).values()
    ).map((member) => {
      const lastActive = getUserLastActive(member.id);
      return {
        ...member,
        lastActive: lastActive ? lastActive.toISOString() : undefined,
        // L'utilisateur actuel est toujours considéré comme actif
        isActive: member.id === currentUserId || !!lastActive,
      };
    });

    return NextResponse.json({ members: uniqueMembers });
  } catch (error) {
    console.error("Erreur lors de la récupération des membres:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des membres" },
      { status: 500 }
    );
  }
}
