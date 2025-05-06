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
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Journalisation de l'erreur côté client
    console.error("Erreur applicative:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md">
        <Card className="border-2 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4">
              <Image
                src="/icon.png"
                width={64}
                height={64}
                alt="co-sport.com logo"
                className="mx-auto"
              />
            </div>
            <CardTitle className="text-2xl font-bold">
              Une erreur est survenue
            </CardTitle>
            <CardDescription>
              Nous rencontrons un problème technique. Veuillez réessayer
              ultérieurement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="my-4 flex flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <AlertTriangle className="size-8 text-amber-500" />
              <p>Erreur 500</p>
              {process.env.NODE_ENV === "development" && (
                <p className="mt-2 text-xs text-red-500">
                  {error.message || "Une erreur inconnue s'est produite"}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => reset()}
              className="flex-1 gap-2"
            >
              <RefreshCw size={16} />
              <span>Réessayer</span>
            </Button>
            <Link href="/" className="flex-1">
              <Button className="w-full gap-2">
                <Home size={16} />
                <span>Accueil</span>
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
