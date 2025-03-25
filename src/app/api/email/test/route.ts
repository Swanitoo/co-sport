import {
  sendJoinRequestEmail,
  sendMembershipAcceptedEmail,
  sendNewMessageEmail,
  sendProductCreatedEmail,
  sendReviewReceivedEmail,
  sendWelcomeEmail,
} from "@/lib/emails";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// Route de test pour tous les types d'emails
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const emailType = searchParams.get("type") || "message";
  const email = searchParams.get("email") || "swan.marin@gmail.com";
  const testSlug = "test-club-de-tennis"; // Slug de test pour tous les exemples

  try {
    let result;

    switch (emailType) {
      case "welcome":
        result = await sendWelcomeEmail(email, "[TEST] Nouvel Utilisateur");
        break;

      case "product_created":
        result = await sendProductCreatedEmail({
          email,
          productName: "[TEST] Club de Tennis",
          productId: "test_id_123",
          isFirstProduct: true,
          slug: testSlug,
        });
        break;

      case "join_request":
        result = await sendJoinRequestEmail(
          email,
          "[TEST] Club de Tennis",
          "test_id_123",
          "[TEST] Jean Dupont",
          "test_user_id",
          testSlug
        );
        break;

      case "membership_accepted":
        result = await sendMembershipAcceptedEmail(
          email,
          "[TEST] Club de Tennis",
          "test_id_123",
          "test_user_id",
          testSlug
        );
        break;

      case "review":
        result = await sendReviewReceivedEmail({
          email,
          productName: "[TEST] Club de Tennis",
          productId: "test_id_123",
          reviewerName: "[TEST] Jean Dupont",
          rating: 4,
          reviewText: "Ceci est un avis de test pour vérifier les emails.",
          userId: "test_user_id",
          slug: testSlug,
        });
        break;

      case "message":
      default:
        result = await sendNewMessageEmail(
          email,
          "[TEST] Club de Tennis",
          "test_id_123",
          "[TEST] Jean Dupont",
          "Ceci est un message de test pour vérifier le système d'email. Ce n'est pas un vrai message.",
          1,
          "test_user_id",
          testSlug
        );
        break;
    }

    if (!result.success) {
      return NextResponse.json(
        { error: `Échec de l'envoi de l'email de test (${emailType})` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Email de test (${emailType}) envoyé avec succès à ${email}`,
      type: emailType,
    });
  } catch (error) {
    console.error(
      `Erreur lors de l'envoi de l'email de test (${emailType}):`,
      error
    );
    return NextResponse.json(
      { error: `Erreur lors de l'envoi de l'email de test (${emailType})` },
      { status: 500 }
    );
  }
}
