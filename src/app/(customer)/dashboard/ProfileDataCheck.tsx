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
import { useEffect, useState } from "react";

interface ProfileDataCheckProps {
  needsSex: boolean;
  needsCountry?: boolean;
  needsEmail?: boolean;
  shouldAskLinkStrava?: boolean;
  existingData?: {
    sex?: string | null;
    country?: string | null;
    email?: string | null;
    stravaConnected?: boolean;
  };
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type Step = "sex" | "country" | "email" | "linkStrava";

export function ProfileDataCheck({
  needsSex,
  needsCountry,
  needsEmail,
  shouldAskLinkStrava,
  existingData = {},
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: ProfileDataCheckProps) {
  // Calculer si l'utilisateur a des données manquantes qui nécessitent l'ouverture de la boîte de dialogue
  const hasMissingData =
    (needsSex && !existingData.sex) ||
    (needsCountry && !existingData.country) ||
    (needsEmail && !existingData.email) ||
    (shouldAskLinkStrava && !existingData.stravaConnected);

  // Si les props de contrôle externe sont fournies, les utiliser. Sinon, utiliser l'état interne.
  const [internalOpen, setInternalOpen] = useState(hasMissingData);

  // Déterminer si la boîte de dialogue est ouverte
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;

  // Fonction pour gérer le changement d'état ouvert/fermé
  const handleOpenChange = (newOpenState: boolean) => {
    if (externalOnOpenChange) {
      externalOnOpenChange(newOpenState);
    } else {
      setInternalOpen(newOpenState);
    }
  };

  const [formData, setFormData] = useState({
    sex: existingData.sex || "",
    country: existingData.country || "",
    email: existingData.email || "",
  });

  // S'assurer que formData est toujours à jour avec les données existantes
  useEffect(() => {
    setFormData({
      sex: existingData.sex || "",
      country: existingData.country || "",
      email: existingData.email || "",
    });
    // Calcul initial de la progression
    setProgress(calculateProgress());
  }, [existingData]);

  // Fonction pour calculer la progression basée sur les données existantes et formData
  const calculateProgress = () => {
    // Calculer le nombre total d'étapes nécessaires
    const totalSteps =
      (needsSex ? 1 : 0) +
      (needsCountry ? 1 : 0) +
      (needsEmail ? 1 : 0) +
      (shouldAskLinkStrava ? 1 : 0);

    // Si aucune étape n'est nécessaire, retourner 100%
    if (totalSteps === 0) return 100;

    // Calculer le nombre d'étapes complétées
    let completedSteps = 0;

    // Vérifier chaque étape nécessaire et compter si elle est complétée
    if (needsSex && (formData.sex || existingData.sex)) {
      completedSteps++;
    }
    if (needsCountry && (formData.country || existingData.country)) {
      completedSteps++;
    }
    if (needsEmail && (formData.email || existingData.email)) {
      completedSteps++;
    }
    if (shouldAskLinkStrava && existingData.stravaConnected) {
      completedSteps++;
    }

    // Calculer le pourcentage de progression
    return Math.min((completedSteps / totalSteps) * 100, 100);
  };

  const [progress, setProgress] = useState(() => calculateProgress());

  // Vérifier si le profil est complet après chaque mise à jour
  useEffect(() => {
    const newProgress = calculateProgress();
    setProgress(newProgress);

    // Si toutes les étapes sont complétées, afficher le succès et fermer la modal après un délai
    if (newProgress >= 100 && isOpen) {
      setShowSuccess(true);

      // Recharger la page après un délai pour refléter les changements
      const timer = setTimeout(() => {
        handleOpenChange(false);
        window.location.reload();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [
    formData,
    existingData,
    needsSex,
    needsCountry,
    needsEmail,
    shouldAskLinkStrava,
    isOpen,
  ]);

  // Déterminer la première étape en tenant compte des données existantes
  const getFirstStep = (): Step => {
    if (needsEmail && !existingData.email && !formData.email) return "email";
    if (needsSex && !existingData.sex && !formData.sex) return "sex";
    if (needsCountry && !existingData.country && !formData.country)
      return "country";
    if (shouldAskLinkStrava && !existingData.stravaConnected)
      return "linkStrava";
    return "sex"; // Fallback
  };

  const [currentStep, setCurrentStep] = useState<Step>(getFirstStep());
  const [showSuccess, setShowSuccess] = useState(false);

  // Mettre à jour currentStep quand les données changent
  useEffect(() => {
    setCurrentStep(getFirstStep());
  }, [formData, existingData]);

  const goToNextStep = () => {
    // Vérifier d'abord si toutes les étapes sont complétées
    const newProgress = calculateProgress();
    if (newProgress >= 100) {
      setShowSuccess(true);
      setTimeout(() => {
        handleOpenChange(false);
        window.location.reload();
      }, 1500);
      return;
    }

    if (
      currentStep === "email" &&
      needsSex &&
      !formData.sex &&
      !existingData.sex
    ) {
      setCurrentStep("sex");
    } else if (
      currentStep === "sex" &&
      needsCountry &&
      !formData.country &&
      !existingData.country
    ) {
      setCurrentStep("country");
    } else if (
      currentStep === "country" &&
      shouldAskLinkStrava &&
      !existingData.stravaConnected
    ) {
      setCurrentStep("linkStrava");
    } else if (shouldAskLinkStrava && !existingData.stravaConnected) {
      setCurrentStep("linkStrava");
    } else {
      // Si toutes les étapes nécessaires sont complétées, afficher le succès
      setShowSuccess(true);
      setTimeout(() => {
        handleOpenChange(false);
        window.location.reload();
      }, 1500);
    }
  };

  const handleSubmit = async (field: string, value: string) => {
    // Mettre à jour formData immédiatement pour une meilleure UX
    setFormData((prev) => ({ ...prev, [field]: value }));

    try {
      // Mettre à jour dans la base de données
      await updateUserProfile({ [field]: value });

      // Mise à jour des données existantes pour refléter le changement
      const updatedExistingData = { ...existingData, [field]: value };

      // Mettre à jour la progression
      setProgress(calculateProgress());

      // Passer à l'étape suivante
      goToNextStep();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  const handleStravaLink = async (link: boolean) => {
    if (link) {
      // Utiliser next-auth/react signIn pour la redirection Strava
      signIn("strava", {
        callbackUrl: "/dashboard",
      });
    } else {
      try {
        await updateUserProfile({ stravaLinkRefused: true });
        setProgress(calculateProgress());
        setShowSuccess(true);
        setTimeout(() => {
          handleOpenChange(false);
          window.location.reload();
        }, 1500);
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
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
              <Progress value={progress} className="h-2 w-full" />
              <p className="text-center text-sm text-muted-foreground">
                {Math.round(progress)}% complété
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
                    defaultValue={formData.email || existingData.email || ""}
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
              <RadioGroup
                onValueChange={(v: string) => handleSubmit("sex", v)}
                defaultValue={formData.sex || existingData.sex || undefined}
              >
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
                onValueChange={(v: string) => handleSubmit("country", v)}
                defaultValue={
                  formData.country || existingData.country || undefined
                }
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
