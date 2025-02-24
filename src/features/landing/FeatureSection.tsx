"use client";

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
        className="light rounded-lg bg-customPurple py-12 md:min-h-[550px] lg:min-h-[650px]"
        id="features"
      >
        <h2 className="text-center text-3xl font-bold text-white">
          Rien de plus simple ! Voici les étapes à suivre :
        </h2>
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
                  {`Filtre les annonces selon tes critères pour trouver le partenaire idéal.`}
                </h2>
                <Card className="w-full max-w-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="size-5" />
                      Filtres
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <h3 className="font-medium">Sports</h3>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => setStep(1)}
                        >
                          🏋️ Musculation
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => setStep(1)}
                        >
                          ⛰️ Alpinisme
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => setStep(1)}
                        >
                          🏃 Trail
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => setStep(1)}
                        >
                          ⚽ Football
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => setStep(1)}
                        >
                          🎾 Tennis
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
                      <h3 className="font-medium">Niveau</h3>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => setStep(1)}
                        >
                          🌱 Débutant
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => setStep(1)}
                        >
                          ⭐ Intermédiaire
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => setStep(1)}
                        >
                          🌟 Avancé
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium">Nationalité</h3>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => setStep(1)}
                        >
                          🇫🇷 France
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => setStep(1)}
                        >
                          🇨🇭 Suisse
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => setStep(1)}
                        >
                          🇵🇪 Pérou
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
                      <h3 className="font-medium">Options</h3>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => setStep(1)}
                        >
                          👩 Entre filles
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => setStep(1)}
                        >
                          👑 Pro (Coach, Guide)
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
                <h2 className="mb-4 rounded-lg bg-gray-800 p-4 text-lg font-bold text-white shadow-md">
                  {`Trouve ton sport et ton partenaire en cliquant sur une annonce qui t'intéresse.`}
                </h2>
                <div className="flex flex-col gap-2 space-y-4">
                  <Card
                    onClick={() => {
                      setStep((s) => s + 1);
                    }}
                    className="cursor-pointer flex-col gap-2 transition-all duration-200 ease-in-out hover:scale-[1.02] hover:bg-accent/5  hover:shadow-lg"
                  >
                    <CardHeader className="flex items-center gap-2 p-4">
                      <CardTitle>Séance jambes</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <CardDescription className="text-center">
                        Sport : Musculation
                      </CardDescription>
                    </CardContent>
                    <CardContent className="p-4 text-center">
                      <p className="truncate-multiline font-mono">
                        Salut ! Je fais les <br /> jambes tous les lundis 😊
                      </p>
                    </CardContent>
                    <CardContent className="p-4 text-center">
                      <p className="overflow-hidden text-ellipsis font-mono">
                        Niveau : Moyen
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
                <h2 className="rounded-lg bg-gray-800 p-4 text-lg font-bold text-white shadow-md">
                  {`Consulte les détails, découvre le profil et clique sur "Rejoindre".`}
                </h2>
                <div className="flex w-full items-center justify-between text-white">
                  <div className="space-y-0.5">
                    <LayoutTitle>Séance Jambes</LayoutTitle>
                    <p className="text-sm">Louise</p>
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
                      <span>{isLoading ? "Rejoindre..." : "Rejoindre"}</span>
                    </Button>
                  </div>
                </div>
                <div className="bg flex gap-4 max-lg:flex-col">
                  <Card className="flex-1 bg-white text-black dark:bg-black dark:text-white">
                    <CardHeader>
                      <CardTitle>Détails</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-start gap-2">
                      <p>Sport : Musculation</p>
                      <p>Niveau : Moyen (3 ans)</p>
                      <div>
                        Salut ! Je fais les jambes tous les lundis, et je serais
                        super ravie de partager mon programme avec quelqu'un !
                        Si tu veux qu'on se motive ensemble, n'hésite pas à me
                        rejoindre ! 😊
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
                  {"Bravo !"}
                </h2>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Tu n'as plus qu'a t'organiser avec ton/ta partenaire ! ✅
                    </CardTitle>

                    <CTASection />
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
