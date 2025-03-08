import { NextRequest, NextResponse } from "next/server";
import { baseAuth } from "../../../../src/auth/auth";

// Utiliser un cache local pour l'activité des utilisateurs
// Dans une application réelle, ce serait dans Redis ou une autre solution de stockage partagée
const userLastActiveMap = new Map<string, Date>();

// Fonction locale pour mettre à jour l'activité utilisateur
function updateUserActivity(userId: string): void {
  userLastActiveMap.set(userId, new Date());
}

export async function POST(req: NextRequest) {
  try {
    const session = await baseAuth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { userId, productId } = body;

    // Vérifier si l'ID utilisateur correspond à l'utilisateur connecté
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez mettre à jour que votre propre activité" },
        { status: 403 }
      );
    }

    // Mettre à jour l'activité dans le cache local
    updateUserActivity(userId);

    return NextResponse.json({
      success: true,
      message: "Activité utilisateur mise à jour",
      lastActive: new Date(),
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'activité:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'activité" },
      { status: 500 }
    );
  }
}
