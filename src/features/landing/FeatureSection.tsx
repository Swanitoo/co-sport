"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Review } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ReviewTextSelector } from "../../../app/(user)/r/[slug]/ReviewTextSelector";
import { ReviewItem } from "../../../app/(user)/wall/[slug]/ReviewCard";
import { Section } from "./Section";
import RatingSelector from "../../../app/(user)/r/[slug]/RatingSelector";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LayoutTitle } from "@/components/layout";
import { Loader2, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signInAction } from "../auth/auth.action";

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
      <Section className="light rounded-lg py-12 bg-customPurple lg:min-h-[650px]" id="features">
        <h2 className="text-center text-3xl font-bold">
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
        <h2 className="text-lg font-bold bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md mb-4 lg:mt-16">
          {`Trouve ton sport et ton partenaire en cliquant sur une séance qui t'intéresse.`}
        </h2>
                <Table>
          <TableHeader>
            <TableRow>
                <TableHead className="text-black dark:text-white">Nom</TableHead>
                <TableHead className="text-black dark:text-white">Sport</TableHead>
                <TableHead className="text-black dark:text-white">Lieux</TableHead>
                <TableHead className="text-black dark:text-white">Avis</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
            onClick={() => {
              setStep((s) => s + 1);
            }}
            className="cursor-pointer"
            >
              <TableCell>
                Scéance jambes
              </TableCell>
              <TableCell className="font-mono">Musculation</TableCell>
              <TableCell className="font-mono">Onair Lyon 3</TableCell>
              <TableCell className="font-mono">
                8
              </TableCell>
            </TableRow>
            <TableRow
            onClick={() => {
              setStep((s) => s + 1);
            }}
            className="cursor-pointer"
            >
              <TableCell>
                SaintéLyon
              </TableCell>
              <TableCell className="font-mono">Trail</TableCell>
              <TableCell className="font-mono">Lyon</TableCell>
              <TableCell className="font-mono">
                1
              </TableCell>
            </TableRow>
              <TableRow
          onClick={() => {
            setStep((s) => s + 1);
          }}
          className="cursor-pointer"
        >
                <TableCell>
                  Coatching
                </TableCell>
                <TableCell className="font-mono">Boxe Anglaise</TableCell>
                <TableCell className="font-mono">Club Rhône</TableCell>
                <TableCell className="font-mono">
                  3
                </TableCell>
              </TableRow>
              <TableRow
          onClick={() => {
            setStep((s) => s + 1);
          }}
          className="cursor-pointer"
        >
                <TableCell>
                  Traversée 3 monts
                </TableCell>
                <TableCell className="font-mono">Alpinisme</TableCell>
                <TableCell className="font-mono">Mont blanc</TableCell>
                <TableCell className="font-mono">
                  12
                </TableCell>
                
              </TableRow>
          </TableBody>
        </Table>
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
          <h2 className="text-lg font-bold bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
            {`Consulte les détails, découvre le profil et clique sur "Rejoindre" si tu souhaites faire une activité avec lui/elle.`}
          </h2>
      <div className="flex justify-between items-center w-full">
        <div className="space-y-0.5">
          <LayoutTitle>Scéance Jambes</LayoutTitle>
          <p className="text-sm">Louise</p>
        </div>
        <div className="flex-shrink-0">
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
      <div className="flex gap-4 max-lg:flex-col bg">
      <Card className="flex-1 bg-white dark:bg-black text-black dark:text-white">
        <CardHeader>
          <CardTitle>Détails</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 items-start">
          <p>Sport : Musculation</p>
          <p>Niveau : Moyen (3 ans)</p>
          <div>
            Salut ! Je fais les jambes tous les lundis, 
            et je serais super ravie de partager mon programme avec quelqu’un ! 
            J’aimerais bien avoir un(e) partenaire pour m’assurer sur les séries, 
            ça m’aiderait vraiment à progresser et à pousser plus loin mes limites. 
            Si tu veux qu’on se motive ensemble, n’hésite pas à me rejoindre ! 😊
          </div>
        </CardContent>
      </Card>
      <Card className="flex-1 bg-white dark:bg-black text-black dark:text-white">
        <CardHeader>
          <CardTitle>Avis</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
                <TableRow>
                  <TableCell>
                    <div>
                      Emma
                    </div>
                  </TableCell>
                  <TableCell>
                  J’ai eu la chance de faire une séance jambes avec elle, 
                  et c’était top ! Son programme est super bien structuré, 
                  et elle m’a vraiment aidé à rester motivé tout au long de l’entraînement. 
                  Elle est aussi super encourageante, surtout sur les séries difficiles. 
                  Hâte de refaire ça ! 💪</TableCell>
                </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </div>


              </motion.div>
            )}
            {step === 2 && (
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
                <h2 className="text-lg font-bold lg:mt-20">
                  {"Bravo !"}
                </h2>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Tu n'as plus qu'a t'organiser avec ton/ta partenaire ! ✅
                      </CardTitle>
                    <CardDescription className="flex justify-center pt-6">
                    <Button onClick={() => {
                      signInAction();
                    }}>
                    Commence maintenant ! 
                  </Button>
                      </CardDescription>
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