"use client";

import { SPORTS } from "@/app/(customer)/annonces/[slug]/edit/product.schema";
import { getFilteredProducts } from "@/app/(customer)/annonces/list/productList.actions";
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
import { Check, HelpCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
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

// Nouvelles étapes pour le guide
type GuideStep =
  | "userType"
  | "sportPreference"
  | "nationalityPreference"
  | "girlsOnlyPreference"
  | "complete";

// Types d'utilisateurs pour le guide
type UserType = "coach" | "sportif" | "debutant";

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

      // Effacer les données de session car tout est complété
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("profileCurrentStep");
        sessionStorage.removeItem("profileCompletedSteps");
      }
    }

    // Nettoyer le stockage de session quand le composant est démonté
    return () => {
      // Ne nettoyer que si toutes les étapes sont complétées
      if (newProgress >= 100 && typeof window !== "undefined") {
        sessionStorage.removeItem("profileCurrentStep");
        sessionStorage.removeItem("profileCompletedSteps");
      }
    };
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
    // Stocker l'étape actuelle en session pour éviter les retours en arrière
    const savedStep = sessionStorage.getItem("profileCurrentStep");
    if (
      savedStep &&
      ["sex", "country", "email", "linkStrava"].includes(savedStep)
    ) {
      return savedStep as Step;
    }

    // Logique pour déterminer la première étape
    if (needsEmail && !existingData.email && !formData.email) {
      sessionStorage.setItem("profileCurrentStep", "email");
      return "email";
    }
    if (needsSex && !existingData.sex && !formData.sex) {
      sessionStorage.setItem("profileCurrentStep", "sex");
      return "sex";
    }
    if (needsCountry && !existingData.country && !formData.country) {
      sessionStorage.setItem("profileCurrentStep", "country");
      return "country";
    }
    if (shouldAskLinkStrava && !existingData.stravaConnected) {
      sessionStorage.setItem("profileCurrentStep", "linkStrava");
      return "linkStrava";
    }
    return "sex"; // Fallback
  };

  const [currentStep, setCurrentStep] = useState<Step>(() => {
    if (typeof window !== "undefined") {
      return getFirstStep();
    }
    return "sex"; // Valeur par défaut pour SSR
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [showCreateAnnonceModal, setShowCreateAnnonceModal] = useState(false);

  // États pour le guide
  const [showGuide, setShowGuide] = useState(false);
  const [guideStep, setGuideStep] = useState<GuideStep>("userType");
  const [userType, setUserType] = useState<UserType | null>(null);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [selectedNationality, setSelectedNationality] = useState<string | null>(
    null
  );
  const [girlsOnly, setGirlsOnly] = useState<boolean>(false);
  const [annoncesCount, setAnnoncesCount] = useState<number>(0);

  // Stocker l'étape complétée pour éviter de revenir en arrière
  const [completedSteps, setCompletedSteps] = useState<Step[]>([]);

  const router = useRouter();

  // Restaurer les étapes complétées depuis sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Récupérer les étapes complétées stockées
      const storedCompletedSteps = sessionStorage.getItem(
        "profileCompletedSteps"
      );
      if (storedCompletedSteps) {
        try {
          const steps = JSON.parse(storedCompletedSteps) as Step[];
          setCompletedSteps(steps);
        } catch (error) {
          console.error(
            "Erreur lors de la restauration des étapes complétées:",
            error
          );
        }
      }
    }
  }, []);

  // Effet pour afficher les boutons après un délai quand showSuccess est true
  useEffect(() => {
    if (showSuccess) {
      // Ajouter un délai pour s'assurer que les boutons apparaissent après l'animation des confettis
      const timer = setTimeout(() => {
        setShowButtons(true);
      }, 1000); // 1 seconde après l'affichage des confettis

      // Nettoyer le timer à la destruction du composant
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  // Mettre à jour currentStep quand les données changent
  useEffect(() => {
    setCurrentStep(getFirstStep());
  }, [formData, existingData]);

  const goToNextStep = () => {
    // Vérifier d'abord si toutes les étapes sont complétées
    const newProgress = calculateProgress();
    if (newProgress >= 100) {
      // Effacer les données de session quand tout est complété
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("profileCurrentStep");
      }
      setShowSuccess(true);
      return;
    }

    // Ajouter l'étape actuelle aux étapes complétées
    setCompletedSteps((prev) => {
      if (!prev.includes(currentStep)) {
        return [...prev, currentStep];
      }
      return prev;
    });

    // Déterminer la prochaine étape
    let nextStep: Step | null = null;

    if (
      currentStep === "email" &&
      needsSex &&
      !formData.sex &&
      !existingData.sex
    ) {
      nextStep = "sex";
    } else if (
      currentStep === "sex" &&
      needsCountry &&
      !formData.country &&
      !existingData.country
    ) {
      nextStep = "country";
    } else if (
      currentStep === "country" &&
      shouldAskLinkStrava &&
      !existingData.stravaConnected
    ) {
      nextStep = "linkStrava";
    } else if (shouldAskLinkStrava && !existingData.stravaConnected) {
      nextStep = "linkStrava";
    } else {
      // Si toutes les étapes nécessaires sont complétées, afficher le succès
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("profileCurrentStep");
      }
      setShowSuccess(true);
      return;
    }

    if (nextStep) {
      // Stocker la prochaine étape en session
      if (typeof window !== "undefined") {
        sessionStorage.setItem("profileCurrentStep", nextStep);
      }
      setCurrentStep(nextStep);
    } else {
      // Si pas de prochaine étape définie, afficher le succès
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("profileCurrentStep");
      }
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

      // Ajouter l'étape actuelle à la liste des étapes complétées
      setCompletedSteps((prev) => {
        if (!prev.includes(currentStep)) {
          return [...prev, currentStep];
        }
        return prev;
      });

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
      // Ajouter l'étape actuelle à la liste des étapes complétées
      setCompletedSteps((prev) => {
        if (!prev.includes(currentStep)) {
          return [...prev, currentStep];
        }
        return prev;
      });

      // Stocker l'étape dans la session pour la récupérer après redirection
      if (typeof window !== "undefined") {
        sessionStorage.setItem("profileCurrentStep", "linkStrava");
        sessionStorage.setItem(
          "profileCompletedSteps",
          JSON.stringify([...completedSteps, "linkStrava"])
        );
      }

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

        // Ajouter l'étape actuelle à la liste des étapes complétées
        setCompletedSteps((prev) => {
          if (!prev.includes(currentStep)) {
            return [...prev, currentStep];
          }
          return prev;
        });

        // Effacer les données de session car tout est complété
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("profileCurrentStep");
          sessionStorage.removeItem("profileCompletedSteps");
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
      // Ajouter l'étape email à la liste des étapes complétées
      setCompletedSteps((prev) => {
        if (!prev.includes("email")) {
          return [...prev, "email"];
        }
        return prev;
      });

      // Si on est dans le navigateur, stocker l'étape dans sessionStorage
      if (typeof window !== "undefined") {
        // Sauvegarder les étapes complétées actuelles + email
        const updatedSteps = completedSteps.includes("email")
          ? completedSteps
          : [...completedSteps, "email"];
        sessionStorage.setItem(
          "profileCompletedSteps",
          JSON.stringify(updatedSteps)
        );
      }

      await handleSubmit("email", emailInput.value);
    }
  };

  // Navigation entre les étapes du guide
  const goToNextGuideStep = () => {
    if (guideStep === "userType") {
      if (userType === "coach") {
        // Pour les coaches, aller directement à l'étape du choix du sport
        setGuideStep("sportPreference");
      } else {
        setGuideStep("sportPreference");
      }
    } else if (guideStep === "sportPreference") {
      // Pour les coaches, passer directement à l'étape finale après le choix du sport
      if (userType === "coach") {
        setGuideStep("complete");
      } else {
        // Pour les sportifs/débutants, continuer vers les préférences culturelles
        setGuideStep("nationalityPreference");
      }
    } else if (guideStep === "nationalityPreference") {
      // Si l'utilisateur est une femme, montrer l'étape des préférences pour les annonces féminines
      if (existingData.sex === "F" || formData.sex === "F") {
        setGuideStep("girlsOnlyPreference");
      } else {
        setGuideStep("complete");
      }
    } else if (guideStep === "girlsOnlyPreference") {
      setGuideStep("complete");
    } else if (guideStep === "complete") {
      finishGuide();
    }
  };

  // Redirection finale après le guide
  const finishGuide = async () => {
    // Vérifier le nombre d'annonces disponibles
    const count = await checkAnnoncesCount();

    // Fermer tous les dialogues
    handleOpenChange(false);
    setShowGuide(false);

    if (userType === "coach") {
      // Pour les coaches, toujours rediriger vers la création d'annonce
      let url = "/annonces/new";
      const searchParams = new URLSearchParams();

      if (selectedSport) {
        searchParams.append("sport", selectedSport);
        searchParams.append("level", "Pro (Coach, Entraîneur, Guide..)");
      }

      if (searchParams.toString()) {
        url += `?${searchParams.toString()}`;
      }

      router.push(url);
    } else {
      // Pour les sportifs/débutants
      if (count < 5) {
        // S'il y a moins de 5 annonces, ouvrir la modale de création d'annonce
        setShowCreateAnnonceModal(true);
      } else {
        // Sinon, rediriger vers la liste d'annonces avec les filtres
        let url = "/annonces";
        const searchParams = new URLSearchParams();

        if (selectedSport) {
          searchParams.append("sport", selectedSport);
        }

        if (selectedNationality) {
          searchParams.append("countries", selectedNationality);
        }

        if (girlsOnly && (existingData.sex === "F" || formData.sex === "F")) {
          searchParams.append("onlyGirls", "true");
        }

        if (searchParams.toString()) {
          url += `?${searchParams.toString()}`;
        }

        router.push(url);
      }
    }
  };

  // Effet pour la redirection automatique à la fin du parcours
  useEffect(() => {
    if (guideStep === "complete") {
      const timer = setTimeout(() => {
        finishGuide();
      }, 3000); // 3 secondes avant la redirection

      return () => clearTimeout(timer);
    }
  }, [guideStep]);

  const checkAnnoncesCount = async () => {
    try {
      // Construire les filtres basés sur les préférences utilisateur
      const filters = {
        sport: selectedSport || undefined,
        countries: selectedNationality ? [selectedNationality] : [],
        onlyGirls:
          girlsOnly && (existingData.sex === "F" || formData.sex === "F"),
      };

      // Récupérer les annonces filtrées
      const annonces = await getFilteredProducts(
        filters,
        existingData.sex || formData.sex || null
      );
      setAnnoncesCount(annonces.length);

      return annonces.length;
    } catch (error) {
      console.error("Erreur lors de la vérification des annonces:", error);
      return 10; // Valeur par défaut pour éviter d'afficher la modale de création en cas d'erreur
    }
  };

  return (
    <>
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
                  {showButtons && (
                    <div className="flex flex-col gap-3">
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          className="flex w-full items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                          onClick={() =>
                            (window.location.href = "/annonces/new")
                          }
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
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowGuide(true);
                            handleOpenChange(false);
                          }}
                          className="flex w-full items-center justify-center gap-2"
                        >
                          <HelpCircle className="size-4" />
                          Guide de démarrage
                        </Button>
                      </motion.div>
                    </div>
                  )}
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
                      defaultValue={
                        formData.sex || existingData.sex || undefined
                      }
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

      {/* Dialog pour le guide */}
      <Dialog open={showGuide} onOpenChange={setShowGuide}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              {guideStep === "userType" && "Quel type de sportif êtes-vous ?"}
              {guideStep === "sportPreference" &&
                "Quel sport souhaitez-vous pratiquer ?"}
              {guideStep === "nationalityPreference" &&
                "Préférence linguistique ou culturelle ?"}
              {guideStep === "girlsOnlyPreference" &&
                "Préférence pour les activités féminines ?"}
              {guideStep === "complete" && "C'est parti !"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {guideStep === "userType" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <p className="text-sm text-muted-foreground">
                  Pour mieux vous orienter, dites-nous quel est votre profil :
                </p>
                <RadioGroup
                  value={userType || ""}
                  onValueChange={(value) => setUserType(value as UserType)}
                >
                  <div className="flex items-center space-x-2 rounded-lg border p-2 hover:bg-accent">
                    <RadioGroupItem value="coach" id="coach" />
                    <Label htmlFor="coach" className="flex-1 cursor-pointer">
                      <div className="font-medium">Coach / Guide</div>
                      <p className="text-sm text-muted-foreground">
                        Vous souhaitez proposer des activités et encadrer des
                        sportifs
                      </p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-lg border p-2 hover:bg-accent">
                    <RadioGroupItem value="sportif" id="sportif" />
                    <Label htmlFor="sportif" className="flex-1 cursor-pointer">
                      <div className="font-medium">Sportif</div>
                      <p className="text-sm text-muted-foreground">
                        Vous pratiquez régulièrement et cherchez des partenaires
                      </p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-lg border p-2 hover:bg-accent">
                    <RadioGroupItem value="debutant" id="debutant" />
                    <Label htmlFor="debutant" className="flex-1 cursor-pointer">
                      <div className="font-medium">Débutant</div>
                      <p className="text-sm text-muted-foreground">
                        Vous débutez et souhaitez être accompagné
                      </p>
                    </Label>
                  </div>
                </RadioGroup>
                <Button
                  onClick={goToNextGuideStep}
                  disabled={!userType}
                  className="w-full"
                >
                  Continuer
                </Button>
              </motion.div>
            )}

            {guideStep === "sportPreference" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <p className="text-sm text-muted-foreground">
                  Quel sport souhaitez-vous pratiquer principalement ?
                </p>
                <Select
                  value={selectedSport || ""}
                  onValueChange={setSelectedSport}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisissez un sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPORTS.map((sport) => (
                      <SelectItem key={sport.name} value={sport.name}>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{sport.icon}</span>
                          <span>{sport.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={goToNextGuideStep} className="w-full">
                  Continuer
                </Button>
              </motion.div>
            )}

            {guideStep === "girlsOnlyPreference" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="mb-2 flex justify-center">
                  <div className="rounded-full bg-purple-100 p-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-purple-600"
                    >
                      <circle cx="12" cy="8" r="5" />
                      <path d="M12 13v8" />
                      <path d="M9 16h6" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Souhaitez-vous voir uniquement des annonces créées par des
                  femmes ?
                </p>
                <RadioGroup
                  onValueChange={(value) => setGirlsOnly(value === "yes")}
                >
                  <div className="flex items-center space-x-2 rounded-lg border border-purple-200 p-2 hover:bg-purple-50">
                    <RadioGroupItem
                      value="yes"
                      id="girls-only-yes"
                      className="border-purple-400 text-purple-600"
                    />
                    <Label
                      htmlFor="girls-only-yes"
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium text-purple-800">Oui</div>
                      <p className="text-sm text-purple-600">
                        Je souhaite voir uniquement des annonces de femmes
                      </p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-lg border p-2 hover:bg-accent">
                    <RadioGroupItem value="no" id="girls-only-no" />
                    <Label
                      htmlFor="girls-only-no"
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">Non</div>
                      <p className="text-sm text-muted-foreground">
                        Je souhaite voir toutes les annonces
                      </p>
                    </Label>
                  </div>
                </RadioGroup>
                <Button onClick={goToNextGuideStep} className="w-full">
                  Continuer
                </Button>
              </motion.div>
            )}

            {guideStep === "nationalityPreference" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <p className="text-sm text-muted-foreground">
                  Souhaitez-vous pratiquer avec des personnes d'une nationalité
                  spécifique pour partager une langue ou une culture ?
                </p>
                <Select
                  value={selectedNationality || ""}
                  onValueChange={setSelectedNationality}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisissez une nationalité (optionnel)" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.flag} {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={goToNextGuideStep} className="w-full">
                  Continuer
                </Button>
              </motion.div>
            )}

            {guideStep === "complete" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-center p-4">
                  <div className="rounded-full bg-green-100 p-3">
                    <Check className="size-6 text-green-600" />
                  </div>
                </div>
                <p className="text-center">
                  {userType === "coach"
                    ? "Parfait ! Vous allez être redirigé vers la création d'annonce pour proposer vos services de coach/guide."
                    : "Parfait ! Vous allez être redirigé vers les annonces correspondant à vos préférences."}
                </p>
                <p className="text-center text-sm text-muted-foreground">
                  Redirection automatique dans quelques secondes...
                </p>
                <Button onClick={finishGuide} className="w-full">
                  {userType === "coach"
                    ? "Créer mon annonce"
                    : "Voir les annonces"}
                </Button>
              </motion.div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modale de création d'annonce si moins de 5 annonces disponibles */}
      <Dialog
        open={showCreateAnnonceModal}
        onOpenChange={setShowCreateAnnonceModal}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              Peu d'annonces disponibles
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-center text-sm">
              Il n'y a actuellement que{" "}
              <span className="font-bold">{annoncesCount}</span> annonces
              correspondant à vos critères. Pourquoi ne pas créer votre propre
              annonce pour trouver des partenaires sportifs ?
            </p>
            <div className="flex flex-col gap-3">
              <Button
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                onClick={() => {
                  setShowCreateAnnonceModal(false);

                  // Construire l'URL avec les paramètres pour la création d'annonce
                  let url = "/annonces/new";
                  const searchParams = new URLSearchParams();

                  if (selectedSport) {
                    searchParams.append("sport", selectedSport);
                  }

                  if (searchParams.toString()) {
                    url += `?${searchParams.toString()}`;
                  }

                  router.push(url);
                }}
              >
                Créer une annonce
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateAnnonceModal(false);

                  // Construire l'URL avec les filtres pour voir les annonces existantes
                  let url = "/annonces";
                  const searchParams = new URLSearchParams();

                  if (selectedSport) {
                    searchParams.append("sport", selectedSport);
                  }

                  if (selectedNationality) {
                    searchParams.append("countries", selectedNationality);
                  }

                  if (
                    girlsOnly &&
                    (existingData.sex === "F" || formData.sex === "F")
                  ) {
                    searchParams.append("onlyGirls", "true");
                  }

                  if (searchParams.toString()) {
                    url += `?${searchParams.toString()}`;
                  }

                  router.push(url);
                }}
              >
                Voir les annonces disponibles
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
