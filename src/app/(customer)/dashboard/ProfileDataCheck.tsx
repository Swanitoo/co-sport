"use client";

import { Button } from "@/components/ui/button";
import { Confetti } from "@/components/ui/confetti";
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
  completionPercentage?: number;
  onProgressUpdate?: (progress: number) => void;
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
  completionPercentage,
  onProgressUpdate,
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
    stravaLinkRefused: false,
  });

  // S'assurer que formData est toujours à jour avec les données existantes
  useEffect(() => {
    setFormData({
      sex: existingData.sex || "",
      country: existingData.country || "",
      email: existingData.email || "",
      stravaLinkRefused: false,
    });
    // Calcul initial de la progression - utiliser le pourcentage passé par le parent si disponible
    if (completionPercentage !== undefined) {
      setProgress(completionPercentage);
    } else {
      setProgress(calculateProgress());
    }
  }, [existingData, completionPercentage]);

  // Fonction pour calculer la progression basée sur les données existantes et formData
  const calculateProgress = () => {
    // Calculer le nombre total d'étapes nécessaires
    const totalSteps = 4; // Toujours 4 champs requis: sex, country, email, strava (comme dans dashboard/page.tsx)

    // Calculer le nombre d'étapes complétées
    let completedSteps = 0;

    // Vérifier les données dans le même ordre que dashboard/page.tsx
    if (formData.sex || existingData.sex) {
      completedSteps++;
    }
    if (formData.country || existingData.country) {
      completedSteps++;
    }
    if (formData.email || existingData.email) {
      completedSteps++;
    }
    // Pour Strava, on considère comme complété si connecté OU si refusé explicitement
    // Le refus est indiqué par l'action "Non merci" dans la modale
    if (
      existingData.stravaConnected ||
      (formData as any).stravaLinkRefused === true
    ) {
      completedSteps++;
    }

    // Calculer le pourcentage de progression, arrondi comme dans dashboard/page.tsx
    return Math.round((completedSteps / totalSteps) * 100);
  };

  const [progress, setProgress] = useState(() =>
    completionPercentage !== undefined
      ? completionPercentage
      : calculateProgress()
  );

  // Vérifier si le profil est complet après chaque mise à jour
  useEffect(() => {
    // Ne pas recalculer si un pourcentage externe est fourni lors du premier rendu
    // mais permettre les mises à jour après les actions de l'utilisateur
    const newProgress = calculateProgress();
    setProgress(newProgress);

    // Si toutes les étapes sont complétées, afficher uniquement l'écran de succès
    if (progress >= 100 && isOpen) {
      setShowSuccess(true);
    }
  }, [
    formData,
    existingData,
    needsSex,
    needsCountry,
    needsEmail,
    shouldAskLinkStrava,
    isOpen,
    progress,
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
    }
  };

  const handleSubmit = async (field: string, value: string) => {
    // Mettre à jour formData immédiatement pour une meilleure UX
    const updatedFormData = { ...formData, [field]: value };
    setFormData(updatedFormData);

    try {
      // Mettre à jour dans la base de données
      await updateUserProfile({ [field]: value });

      // Créer une copie des données existantes avec la nouvelle valeur
      const updatedExistingData = {
        ...existingData,
        [field]: value,
      };

      // Recalculer la progression avec les données mises à jour
      const updatedProgress = calculateProgressWithData(
        updatedFormData,
        updatedExistingData
      );
      setProgress(updatedProgress);

      // Mettre à jour l'état pour refléter les changements
      if (onProgressUpdate) {
        onProgressUpdate(updatedProgress);
      }

      // Passer à l'étape suivante
      goToNextStep();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  // Fonction auxiliaire pour calculer la progression avec des données spécifiques
  const calculateProgressWithData = (
    formDataToUse: any,
    existingDataToUse: any
  ) => {
    const totalSteps = 4;
    let completedSteps = 0;

    if (formDataToUse.sex || existingDataToUse.sex) {
      completedSteps++;
    }
    if (formDataToUse.country || existingDataToUse.country) {
      completedSteps++;
    }
    if (formDataToUse.email || existingDataToUse.email) {
      completedSteps++;
    }
    if (
      existingDataToUse.stravaConnected ||
      formDataToUse.stravaLinkRefused === true
    ) {
      completedSteps++;
    }

    return Math.round((completedSteps / totalSteps) * 100);
  };

  const handleStravaLink = async (link: boolean) => {
    if (link) {
      // Utiliser next-auth/react signIn pour la redirection Strava
      signIn("strava", {
        callbackUrl: "/dashboard",
      });
    } else {
      try {
        // Mettre à jour formData immédiatement pour une meilleure UX
        const updatedFormData = { ...formData, stravaLinkRefused: true };
        setFormData(updatedFormData);

        await updateUserProfile({ stravaLinkRefused: true });

        // Recalculer la progression avec les données mises à jour
        const updatedProgress = calculateProgressWithData(
          updatedFormData,
          existingData
        );
        setProgress(updatedProgress);

        // Mettre à jour l'état pour refléter les changements
        if (onProgressUpdate) {
          onProgressUpdate(updatedProgress);
        }

        setShowSuccess(true);
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
          <>
            <Confetti trigger={showSuccess} type="success" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center justify-center space-y-4 p-4"
            >
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="flex size-16 items-center justify-center rounded-full bg-green-100"
              >
                <Check className="size-8 text-green-600" />
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xl font-medium"
              >
                Profil complété !
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-4 w-full space-y-4"
              >
                <p className="text-center text-sm text-muted-foreground">
                  Félicitations ! Vous êtes maintenant prêt à rejoindre la
                  communauté sportive.
                </p>
                <div className="flex flex-col gap-3">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      className="flex w-full items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                      onClick={() => (window.location.href = "/annonces/new")}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        className="mr-2"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="16" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                      </svg>
                      Créer une annonce
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      onClick={() => (window.location.href = "/annonces")}
                      className="w-full"
                    >
                      Voir les annonces
                    </Button>
                  </motion.div>
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  En créant une annonce, vous pourrez trouver des partenaires
                  sportifs selon vos critères et intérêts !
                </p>
              </motion.div>
            </motion.div>
          </>
        ) : (
          <>
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
                        defaultValue={
                          formData.email || existingData.email || ""
                        }
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
                    Liez votre compte Strava pour importer vos activités
                    sportives et trouver des partenaires avec des niveaux
                    similaires.
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
