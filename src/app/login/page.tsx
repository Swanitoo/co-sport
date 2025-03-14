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
import { useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/";
  const error = searchParams?.get("error");
  const fromProfileDataCheck = searchParams?.get("from") === "profileDataCheck";
  const [errorDetails, setErrorDetails] = useState<string | null>(error);

  // Traduire les erreurs d'authentification pour les utilisateurs
  const getErrorMessage = (errorCode: string) => {
    const errorMessages: Record<string, string> = {
      AccessDenied: "Accès refusé. Vérifiez vos identifiants.",
      Verification: "Un lien de vérification a été envoyé à votre email.",
      Configuration:
        "Problème de configuration du serveur. Contactez l'administrateur.",
      OAuthSignin:
        "Erreur lors de la connexion avec le fournisseur d'authentification.",
      OAuthCallback:
        "Erreur lors de la réponse du fournisseur d'authentification.",
      OAuthCreateAccount: "Impossible de créer un compte utilisateur.",
      EmailCreateAccount:
        "Impossible de créer un compte utilisateur avec cet email.",
      Callback: "Erreur de redirection après connexion.",
      OAuthAccountNotLinked: "Ce compte est déjà lié à un autre profil.",
      EmailSignin: "Vérifiez votre email pour le lien de connexion.",
      CredentialsSignin: "Identifiants incorrects.",
      SessionRequired: "Vous devez être connecté pour accéder à cette page.",
      Default: "Erreur de connexion. Veuillez réessayer.",
      MissingCSRF: "Session expirée. Veuillez rafraîchir la page et réessayer.",
      AdapterError:
        "Problème avec la base de données. Contactez l'administrateur.",
    };

    return errorMessages[errorCode] || `Erreur non identifiée: ${errorCode}`;
  };

  useEffect(() => {
    if (error) {
      console.log("Erreur d'authentification:", error);
      setErrorDetails(getErrorMessage(error));
    }
  }, [error]);

  // Si l'utilisateur vient du ProfileDataCheck, lancer directement la connexion Strava
  useEffect(() => {
    if (fromProfileDataCheck) {
      handleStravaLogin();
    }
  }, [fromProfileDataCheck]);

  const handleGoogleLogin = async () => {
    try {
      await signIn("google", { callbackUrl });
    } catch (error) {
      console.error("Erreur de connexion:", error);
      setErrorDetails(
        "Erreur lors de la connexion à Google. Veuillez réessayer."
      );
    }
  };

  const handleStravaLogin = async () => {
    try {
      await signIn("strava", { callbackUrl });
    } catch (error) {
      console.error("Erreur de connexion:", error);
      setErrorDetails(
        "Erreur lors de la connexion à Strava. Veuillez réessayer."
      );
    }
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
          <CardTitle className="text-2xl">
            {fromProfileDataCheck ? "Connexion à Strava" : "Se connecter"}
          </CardTitle>
          <CardDescription>
            {fromProfileDataCheck
              ? "Liez votre compte Strava pour compléter votre profil"
              : "Connectez-vous à votre compte pour continuer"}
          </CardDescription>
          {errorDetails && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <div className="text-sm font-medium text-red-800">
                {errorDetails}
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {!fromProfileDataCheck && (
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
            )}

            <Button
              onClick={handleStravaLogin}
              className="flex w-full items-center justify-center gap-2 bg-[#FC4C02] hover:bg-[#E34000]"
              size="lg"
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="currentColor"
                className="text-white"
              >
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
              </svg>
              {fromProfileDataCheck
                ? "Se connecter avec Strava"
                : "Continuer avec Strava"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
