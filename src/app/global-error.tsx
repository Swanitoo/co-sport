"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Journalisation de l'erreur côté client
    console.error("Erreur globale:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex h-screen flex-col items-center justify-center bg-background p-4">
          <div className="w-full max-w-md rounded-lg border bg-card p-8 shadow-xl">
            <h2 className="mb-4 text-2xl font-bold text-destructive">
              Erreur système
            </h2>
            <p className="mb-6 text-card-foreground">
              Une erreur critique est survenue. Veuillez rafraîchir la page.
            </p>
            {error.digest && (
              <p className="mb-6 text-sm text-muted-foreground">
                Référence d'erreur: {error.digest}
              </p>
            )}
            <Button
              onClick={() => reset()}
              className="flex w-full items-center justify-center gap-2"
            >
              <RefreshCw className="size-4" />
              <span>Réessayer</span>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
