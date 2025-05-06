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
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/";
  const error = searchParams?.get("error");
  const fromProfileDataCheck = searchParams?.get("from") === "profileDataCheck";
  const [errorDetails, setErrorDetails] = useState<string | null>(error);
  const t = useTranslations("Auth");

  // Traduire les erreurs d'authentification pour les utilisateurs
  const getErrorMessage = useCallback(
    (errorCode: string) => {
      const errorMessages: Record<string, string> = {
        AccessDenied: t("errors.accessDenied"),
        Verification: t("errors.verification"),
        Configuration: t("errors.configuration"),
        OAuthSignin: t("errors.oauthSignin"),
        OAuthCallback: t("errors.oauthCallback"),
        OAuthCreateAccount: t("errors.oauthCreateAccount"),
        EmailCreateAccount: t("errors.emailCreateAccount"),
        Callback: t("errors.callback"),
        OAuthAccountNotLinked: t("errors.oauthAccountNotLinked"),
        EmailSignin: t("errors.emailSignin"),
        CredentialsSignin: t("errors.credentialsSignin"),
        SessionRequired: t("errors.sessionRequired"),
        Default: t("errors.default"),
        MissingCSRF: t("errors.missingCSRF"),
        AdapterError: t("errors.adapterError"),
      };

      return errorMessages[errorCode] || `${t("errors.unknown")}: ${errorCode}`;
    },
    [t]
  );

  const handleGoogleLogin = async () => {
    try {
      await signIn("google", { callbackUrl });
    } catch (error) {
      console.error("Erreur de connexion:", error);
      setErrorDetails(t("errors.googleLogin"));
    }
  };

  const handleStravaLogin = useCallback(async () => {
    try {
      await signIn("strava", { callbackUrl });
    } catch (error) {
      console.error("Erreur de connexion:", error);
      setErrorDetails(t("errors.stravaLogin"));
    }
  }, [callbackUrl, t]);

  useEffect(() => {
    if (error) {
      console.log("Erreur d'authentification:", error);
      setErrorDetails(getErrorMessage(error));
    }
  }, [error, getErrorMessage]);

  // Si l'utilisateur vient du ProfileDataCheck, lancer directement la connexion Strava
  useEffect(() => {
    if (fromProfileDataCheck) {
      handleStravaLogin();
    }
  }, [fromProfileDataCheck, handleStravaLogin]);

  return (
    <div className="container flex min-h-screen items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <Image
              src="/logo.png"
              alt="CO-Sport Logo"
              width={120}
              height={120}
              priority
            />
          </div>
          <CardTitle className="text-2xl">
            {fromProfileDataCheck ? t("stravaLogin") : t("login")}
          </CardTitle>
          <CardDescription>
            {fromProfileDataCheck
              ? t("linkStravaProfile")
              : t("loginToContinue")}
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
                {t("continueWithGoogle")}
              </Button>
            )}

            <Button
              onClick={handleStravaLogin}
              className="flex w-full items-center justify-center gap-3 bg-[#FC4C02] text-white hover:bg-[#E34000]"
              size="lg"
            >
              <div className="flex size-5 items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="currentColor"
                  className="min-w-[20px] text-white"
                >
                  <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                </svg>
              </div>
              <span>
                {fromProfileDataCheck
                  ? t("loginWithStrava")
                  : t("continueWithStrava")}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
