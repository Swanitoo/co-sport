"use client";

import { useAppTranslations } from "@/components/i18n-provider";
import { LayoutTitle } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Filter, Loader2, UsersRound } from "lucide-react";
import { useState } from "react";
import { CTASection } from "./CTASection";
import { Section } from "./Section";

export const FeatureSection = () => {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useAppTranslations();

  const handleJoin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep((s) => s + 1);
    }, 500);
  };

  return (
    <>
      <Section
        className="light rounded-lg bg-primary/90 py-12 md:min-h-[550px] lg:min-h-[650px]"
        id="features"
      >
        <h3 className="text-center text-3xl font-bold text-white">
          {t("Features.Title")}
        </h3>
        <div className={cn("w-full flex flex-col items-center py-4")}>
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step-0"
                exit={{
                  opacity: 0,
                  x: -100,
                }}
                className="flex h-full flex-col items-center justify-center gap-4"
              >
                <h2 className="mb-4 rounded-lg bg-gray-800 p-4 text-lg font-bold text-white shadow-md lg:mt-16">
                  {t("Features.Step1.Title")}
                </h2>
                <Card className="w-full max-w-[90vw] md:max-w-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 truncate">
                      <Filter className="size-5 shrink-0" />
                      {t("Features.Filters")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <h3 className="font-medium">{t("Features.Sports")}</h3>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => setStep(1)}
                        >
                          🏋️ {t("Sports.Musculation")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => setStep(1)}
                        >
                          ⛰️ {t("Sports.Alpinisme")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => setStep(1)}
                        >
                          🏃 {t("Sports.Trail")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => setStep(1)}
                        >
                          ⚽ {t("Sports.Football")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => setStep(1)}
                        >
                          🎾 {t("Sports.Tennis")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full opacity-50"
                          onClick={() => setStep(1)}
                        >
                          ...
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium">{t("Features.Level")}</h3>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => setStep(1)}
                        >
                          🌱 {t("Levels.Débutant")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => setStep(1)}
                        >
                          ⭐ {t("Levels.Intermédiaire")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => setStep(1)}
                        >
                          🌟 {t("Levels.Avancé")}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium">
                        {t("Features.Nationality")}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => setStep(1)}
                        >
                          🇫🇷 {t("Countries.France")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => setStep(1)}
                        >
                          🇨🇭 {t("Countries.Suisse")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => setStep(1)}
                        >
                          🇵🇪 {t("Countries.Pérou")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full opacity-50"
                          onClick={() => setStep(1)}
                        >
                          ...
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium">
                        {t("Features.Options.Title")}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => setStep(1)}
                        >
                          👩 {t("Features.Options.GirlsOnly")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => setStep(1)}
                        >
                          👑 {t("Features.Options.Pro")}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step-1"
                exit={{
                  opacity: 0,
                  x: -100,
                }}
                className="flex h-full flex-col items-center justify-center gap-4"
              >
                <h2 className="mb-4 max-w-[90vw] truncate rounded-lg bg-gray-800 p-4 text-center text-lg font-bold text-white shadow-md lg:mt-16">
                  {t("Features.Step1.Title")}
                </h2>
                <div className="flex flex-col gap-2 space-y-4">
                  <Card
                    onClick={() => {
                      setStep((s) => s + 1);
                    }}
                    className="w-full max-w-[90vw] cursor-pointer flex-col gap-2 transition-all duration-200 ease-in-out hover:scale-[1.02] hover:bg-accent/5 hover:shadow-lg md:max-w-2xl"
                  >
                    <CardHeader className="flex items-center gap-2 p-4">
                      <CardTitle className="truncate">
                        {t("Features.Step2.ExampleTitle")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <CardDescription className="truncate text-center">
                        {t("Features.Step2.Sport")} : {t("Sports.Musculation")}
                      </CardDescription>
                    </CardContent>
                    <CardContent className="p-4 text-center">
                      <p className="line-clamp-3 font-mono">
                        {t("Features.Step2.ExampleDescription")}
                      </p>
                    </CardContent>
                    <CardContent className="p-4 text-center">
                      <p className="truncate font-mono">
                        {t("Features.Step2.Level")} : {t("Levels.Moyen")}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                exit={{
                  opacity: 0,
                  x: -100,
                }}
                className="flex h-full flex-col items-center justify-center gap-4"
              >
                <h2 className="mb-4 max-w-[90vw] truncate rounded-lg bg-gray-800 p-4 text-center text-lg font-bold text-white shadow-md">
                  {t("Features.Step3.Title")}
                </h2>
                <div className="flex w-full max-w-[90vw] flex-col gap-4 text-white md:max-w-2xl md:flex-row md:items-center md:justify-between">
                  <div className="space-y-0.5">
                    <LayoutTitle className="truncate">
                      {t("Features.Step3.ExampleTitle")}
                    </LayoutTitle>
                    <p className="truncate text-sm">
                      {t("Features.Step3.ExampleName")}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <Button
                      className="flex items-center gap-2"
                      onClick={handleJoin}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <UsersRound />
                      )}
                      <span>
                        {isLoading
                          ? t("Features.Step3.JoiningButton")
                          : t("Features.Step3.JoinButton")}
                      </span>
                    </Button>
                  </div>
                </div>
                <div className="flex w-full max-w-[90vw] gap-4 max-lg:flex-col md:max-w-2xl">
                  <Card className="flex-1 bg-white text-black dark:bg-black dark:text-white">
                    <CardHeader>
                      <CardTitle className="truncate">
                        {t("Features.Step3.Details")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-start gap-2">
                      <p className="truncate">
                        {t("Features.Step3.Sport")} : {t("Sports.Musculation")}
                      </p>
                      <p className="truncate">
                        {t("Features.Step3.Level")} :{" "}
                        {t("Features.Step3.ExampleLevel")}
                      </p>
                      <div className="line-clamp-3">
                        {t("Features.Step3.ExampleDescription")}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
            {step === 3 && (
              <motion.div
                key="step-3"
                exit={{
                  opacity: 0,
                  x: -100,
                }}
                initial={{
                  opacity: 0,
                  x: 100,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                className="flex h-full max-w-lg flex-col items-center justify-center gap-4"
              >
                <h2 className="text-lg font-bold text-white lg:mt-10">
                  {t("Features.Step4.Title")}
                </h2>
                <Card>
                  <CardHeader>
                    <CardTitle>{t("Features.Step4.Description")}</CardTitle>
                    <CTASection
                      translations={{ cta_button: t("Home.cta_button") }}
                    />
                  </CardHeader>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Section>
    </>
  );
};
