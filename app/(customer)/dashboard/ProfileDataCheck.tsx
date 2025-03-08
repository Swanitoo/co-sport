"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useState } from "react";
interface ProfileDataCheckProps {
  needsSex: boolean;
  needsCountry?: boolean;
}

type Step = "sex" | "country";

export function ProfileDataCheck({
  needsSex,
  needsCountry,
}: ProfileDataCheckProps) {
  const [open, setOpen] = useState(needsSex || needsCountry);
  const [currentStep, setCurrentStep] = useState<Step>(
    needsSex ? "sex" : "country",
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    sex: "",
    country: "",
  });

  const getProgress = () => {
    const total = (needsSex ? 1 : 0) + (needsCountry ? 1 : 0);
    const completed = (formData.sex ? 1 : 0) + (formData.country ? 1 : 0);
    return 50 + (completed / total) * 50;
  };

  const handleSubmit = async (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    try {
      await updateUserProfile({ [field]: value });

      if (field === "sex" && needsCountry) {
        setCurrentStep("country");
        return;
      }

      setShowSuccess(true);
      // Revalider la session
      window.location.reload();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
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
                {getProgress()}% complété
              </p>
            </div>
          </div>
        )}
        <AnimatePresence mode="wait">
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
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
