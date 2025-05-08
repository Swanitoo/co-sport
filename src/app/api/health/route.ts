import { withErrorHandler } from "@/lib/error-handler";
import { NextResponse } from "next/server";

/**
 * Route API pour vérifier l'état de santé de l'application
 * Utilisée pour les vérifications par les services externes comme Google
 */
export const GET = withErrorHandler(async () => {
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || "development",
      nodeVersion: process.version,
    },
    { status: 200 }
  );
});
