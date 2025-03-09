"use client";

import { useAppTranslations } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";

interface LoginDialogProps {
  trigger: React.ReactNode;
}

export function LoginDialog({ trigger }: LoginDialogProps) {
  const [open, setOpen] = useState(false);
  const { t } = useAppTranslations();

  const handleGoogleLogin = async () => {
    await signIn("google", { callbackUrl: "/" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex justify-center">
            <Image
              src="/opengraph-image.png"
              alt={t("AppName", "CO-Sport")}
              width={120}
              height={120}
              priority
            />
          </div>
          <DialogTitle className="text-center text-2xl">
            {t("Auth.SignIn", "Se connecter")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t(
              "Auth.ConnectToContinue",
              "Connectez-vous à votre compte pour continuer"
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
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
            {t("Auth.ContinueWithGoogle", "Continuer avec Google")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
