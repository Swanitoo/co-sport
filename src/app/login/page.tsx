"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/";
  const error = searchParams?.get("error");

  const handleGoogleLogin = async () => {
    await signIn("google", { callbackUrl });
  };

  return (
    <div className="container flex min-h-screen items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <Image
              src="/opengraph-image.png"
              alt="CO-Sport Logo"
              width={120}
              height={120}
              priority
            />
          </div>
          <CardTitle className="text-2xl">Se connecter</CardTitle>
          <CardDescription>
            Connectez-vous à votre compte pour continuer
          </CardDescription>
          {error && (
            <div className="mt-2 text-sm text-red-500">
              Erreur:{" "}
              {error === "MissingCSRF" ? "Session expirée. Réessayez." : error}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Button
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-2"
              size="lg"
            >
              <Image
                src="https://authjs.dev/img/providers/google.svg"
                alt="Google"
                width={20}
                height={20}
                unoptimized
              />
              Continuer avec Google
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
