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
    // Log l'erreur sur un service de monitoring (optionnel)
    console.error("Erreur globale:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Une erreur inattendue s'est produite</CardTitle>
          <CardDescription>
            Nous sommes désolés pour ce désagrément. Notre équipe a été informée
            de ce problème.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            {process.env.NODE_ENV !== "production"
              ? `Erreur: ${error.message}`
              : "Veuillez réessayer ultérieurement ou contacter notre support si le problème persiste."}
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
  );
}
