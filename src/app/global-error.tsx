"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Enregistrer l'erreur dans un service de monitoring
    console.error("Erreur globale:", error);
  }, [error]);

  return (
    <html lang="fr">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Erreur Critique</CardTitle>
              <CardDescription>
                Nous rencontrons un problème technique au niveau du serveur.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                {process.env.NODE_ENV !== "production"
                  ? `Erreur: ${error.message}`
                  : "Nos équipes ont été informées et travaillent à résoudre ce problème."}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/")}
              >
                Retour à l'accueil
              </Button>
              <Button onClick={() => reset()}>Réessayer</Button>
            </CardFooter>
          </Card>
        </div>
      </body>
    </html>
  );
}
