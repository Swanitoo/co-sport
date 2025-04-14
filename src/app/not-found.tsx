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
import { Home } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
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
              Page non trouvée
            </CardTitle>
            <CardDescription>
              La page que vous recherchez n'existe pas ou a été déplacée.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="my-4 text-center text-muted-foreground">
              <p>Erreur 404</p>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/" className="w-full">
              <Button className="w-full gap-2">
                <Home size={16} />
                <span>Retour à l'accueil</span>
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
