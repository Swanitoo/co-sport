"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log l'erreur au serveur
    console.error("Erreur globale:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex h-screen flex-col items-center justify-center">
          <div className="rounded-lg bg-white p-8 shadow-xl">
            <h2 className="mb-4 text-2xl font-bold text-red-600">
              Une erreur s'est produite
            </h2>
            <p className="mb-6 text-gray-700">
              {error.message || "Quelque chose s'est mal passé."}
            </p>
            {error.digest && (
              <p className="mb-6 text-sm text-gray-500">
                Référence d'erreur: {error.digest}
              </p>
            )}
            <Button
              onClick={() => reset()}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition duration-300 hover:bg-blue-700"
            >
              Réessayer
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
