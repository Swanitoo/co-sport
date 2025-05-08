import { prisma } from "@/lib/db";
import { withErrorHandler } from "@/lib/error-handler";
import { NextResponse } from "next/server";

/**
 * Route API pour vérifier l'état détaillé de l'application
 * Utilisée pour la surveillance interne du système
 */
export const GET = withErrorHandler(async () => {
  // Tableau pour stocker les résultats des vérifications
  const checks = {
    database: { status: "unknown" as "ok" | "error" | "unknown", details: "" },
    redis: { status: "unknown" as "ok" | "error" | "unknown", details: "" },
    system: { status: "ok" as "ok" | "error" | "unknown" },
  };

  // Vérification de la base de données
  try {
    // Simple requête pour vérifier la connexion à la base de données
    await prisma.$queryRaw`SELECT 1`;
    checks.database.status = "ok";
  } catch (error) {
    checks.database.status = "error";
    checks.database.details = (error as Error).message;
  }

  // Vérification générale du système
  const memory = process.memoryUsage();
  const systemInfo = {
    uptime: process.uptime(),
    memory: {
      rss: Math.round(memory.rss / 1024 / 1024), // en MB
      heapTotal: Math.round(memory.heapTotal / 1024 / 1024), // en MB
      heapUsed: Math.round(memory.heapUsed / 1024 / 1024), // en MB
    },
    nodeVersion: process.version,
    env: process.env.NODE_ENV,
  };

  const allChecksOk = Object.values(checks).every(
    (check) => check.status === "ok"
  );

  return NextResponse.json(
    {
      status: allChecksOk ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || "development",
      checks,
      systemInfo,
    },
    { status: allChecksOk ? 200 : 207 } // Multi-Status si certains services sont dégradés
  );
});
