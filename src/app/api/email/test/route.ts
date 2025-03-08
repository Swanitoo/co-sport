import { sendNewMessageEmail } from "@/lib/emails";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await sendNewMessageEmail(
      "swan.marin@gmail.com", // Remplacez par votre email
      "Tennis Club Paris",
      "prod_123",
      "John Doe",
      "Salut ! Je suis intéressé par votre annonce.",
      1
    );

    if (!result.success) {
      return NextResponse.json(
        { error: "Échec de l'envoi de l'email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email envoyé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de l'email" },
      { status: 500 }
    );
  }
}
