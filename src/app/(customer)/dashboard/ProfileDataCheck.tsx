"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRIES } from "@/data/country";
import { updateUserProfile } from "@/features/auth/auth.action";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";

interface ProfileDataCheckProps {
  needsSex: boolean;
  needsCountry?: boolean;
  needsEmail?: boolean;
  shouldAskLinkStrava?: boolean;
}

type Step = "sex" | "country" | "email" | "linkStrava";

export function ProfileDataCheck({
  needsSex,
  needsCountry,
  needsEmail,
  shouldAskLinkStrava,
}: ProfileDataCheckProps) {
  const [open, setOpen] = useState(
    needsSex || needsCountry || needsEmail || shouldAskLinkStrava
  );

  // Déterminer la première étape
  const getFirstStep = (): Step => {
    if (needsEmail) return "email";
    if (needsSex) return "sex";
    if (needsCountry) return "country";
    if (shouldAskLinkStrava) return "linkStrava";
    return "sex"; // Fallback
  };

  const [currentStep, setCurrentStep] = useState<Step>(getFirstStep());
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    sex: "",
    country: "",
    email: "",
  });

  const getProgress = () => {
    const total =
      (needsSex ? 1 : 0) +
      (needsCountry ? 1 : 0) +
      (needsEmail ? 1 : 0) +
      (shouldAskLinkStrava ? 1 : 0);
    let completed = 0;
    if (formData.sex) completed++;
    if (formData.country) completed++;
    if (formData.email) completed++;
    if (currentStep === "linkStrava" || !shouldAskLinkStrava) completed++;
    return (completed / total) * 100;
  };

  const handleSubmit = async (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    try {
      await updateUserProfile({ [field]: value });

      // Déterminer la prochaine étape
      if (field === "email" && needsSex) {
        setCurrentStep("sex");
        return;
      }
      if (field === "sex" && needsCountry) {
        setCurrentStep("country");
        return;
      }
      if (field === "country" && shouldAskLinkStrava) {
        setCurrentStep("linkStrava");
        return;
      }

      // Si c'est la dernière étape, montrer le succès
      if (
        (field === "email" &&
          !needsSex &&
          !needsCountry &&
          !shouldAskLinkStrava) ||
        (field === "sex" && !needsCountry && !shouldAskLinkStrava) ||
        (field === "country" && !shouldAskLinkStrava)
      ) {
        setShowSuccess(true);
        // Revalider la session
        setTimeout(() => window.location.reload(), 1500);
        return;
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  const handleStravaLink = async (link: boolean) => {
    if (link) {
      // Rediriger vers Strava pour lier le compte
      await signIn("strava", { callbackUrl: "/dashboard" });
    } else {
      // Marquer comme refusé pour ne plus demander
      try {
        await updateUserProfile({ stravaLinkRefused: true });
        setShowSuccess(true);
        setTimeout(() => window.location.reload(), 1500);
      } catch (error) {
        console.error("Erreur lors de la mise à jour:", error);
      }
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    const emailInput = formElement.querySelector(
      'input[name="email"]'
    ) as HTMLInputElement;
    if (emailInput && emailInput.value) {
      await handleSubmit("email", emailInput.value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        {showSuccess ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex flex-col items-center justify-center space-y-2 p-4"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-green-100">
              <Check className="size-6 text-green-600" />
            </div>
            <p className="text-lg font-medium">Profil complété !</p>
          </motion.div>
        ) : (
          <div className="mb-6 space-y-4">
            <DialogHeader>
              <DialogTitle className="text-center text-xl">
                Complétez votre profil
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Progress value={getProgress()} className="h-2 w-full" />
              <p className="text-center text-sm text-muted-foreground">
                {Math.round(getProgress())}% complété
              </p>
            </div>
          </div>
        )}
        <AnimatePresence mode="wait">
          {currentStep === "email" && (
            <motion.div
              key="email-step"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="space-y-4"
            >
              <DialogHeader>
                <DialogTitle>Entrez votre email</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="votre@email.com"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Continuer
                </Button>
              </form>
            </motion.div>
          )}

          {currentStep === "sex" && (
            <motion.div
              key="sex-step"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="space-y-4"
            >
              <DialogHeader>
                <DialogTitle>Choisissez votre genre</DialogTitle>
              </DialogHeader>
              <RadioGroup onValueChange={(v: string) => handleSubmit("sex", v)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="M" id="M" />
                  <Label htmlFor="M">Homme</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="F" id="F" />
                  <Label htmlFor="F">Femme</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="O" id="O" />
                  <Label htmlFor="O">Autre</Label>
                </div>
              </RadioGroup>
            </motion.div>
          )}

          {currentStep === "country" && (
            <motion.div
              key="country-step"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="space-y-4"
            >
              <DialogHeader>
                <DialogTitle>Sélectionnez votre nationalité</DialogTitle>
              </DialogHeader>
              <Select
                onValueChange={async (v: string) => {
                  await updateUserProfile({ country: v });
                  handleSubmit("country", v);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisissez un pays" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.flag} {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>
          )}

          {currentStep === "linkStrava" && (
            <motion.div
              key="strava-step"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="space-y-4"
            >
              <DialogHeader>
                <DialogTitle>Lier votre compte Strava</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Liez votre compte Strava pour importer vos activités sportives
                et trouver des partenaires avec des niveaux similaires.
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => handleStravaLink(true)}
                  className="flex w-full items-center justify-center gap-2 bg-[#FC4C02] hover:bg-[#E34000]"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="currentColor"
                  >
                    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                  </svg>
                  Connecter avec Strava
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleStravaLink(false)}
                >
                  Non merci
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
