"use client";

import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Review } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ReviewTextSelector } from "../../../app/(user)/r/[slug]/ReviewTextSelector";
import { SocialSelector } from "../../../app/(user)/r/[slug]/SocialSelector";
import { ReviewItem } from "../../../app/(user)/wall/[slug]/ReviewCard";
import { Section } from "./Section";
import RatingSelector from "../../../app/(user)/r/[slug]/RatingSelector";

export const FeatureSection = () => {
  const [step, setStep] = useState(0);

  return (
    <>
      <Section className="pb-2" id="features">
        <h2 className="text-center text-3xl font-bold">
          Le procéder est simple :
        </h2>
      </Section>
      <Section className="light rounded-lg bg-gradient-to-r from-fuchsia-600 to-pink-600 py-12 text-foreground shadow">
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
                <h2 className="text-lg font-bold">
                  {`Que penses-tu de co-sport.com`}
                </h2>
                <RatingSelector
                  onSelect={(review) => {
                    setStep((s) => s + 1);
                  }}
                />
              </motion.div>
            )}
            {step === 1 && (
              <motion.div
                key="step-1"
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
                className="flex h-full flex-col items-center justify-center gap-4"
              >
                <h2 className="text-lg font-bold">
                  {"J'ai besoin de plus d'informations sur toi"}
                </h2>
                <SocialSelector
                  onSelect={(name, url) => {
                    setStep((s) => s + 1);
                  }}
                />
              </motion.div>
            )}
            {step === 2 && (
              <motion.div
                key="step-2"
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
                className="flex h-full flex-col items-center justify-center gap-4"
              >
                <h2 className="text-lg font-bold">
                  {"Dis moi ce que tu as aimé est moins aimé ?"}
                </h2>
                <ReviewTextSelector
                  onInputSend={(i) => {
                    setStep((s) => s + 1);
                  }}
                  productId={""}
                />
                <p>PS : Not working for the landing page</p>
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
                <h2 className="text-lg font-bold">
                  {"Merci pour ton avis!"}
                </h2>
                <Card>
                  <CardHeader>
                    <CardDescription>
                      Ton avis a bien été publié ! ✅
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Section>
      <Section className="flex flex-col items-center justify-center gap-8">
        <h2 className="text-center text-3xl font-bold">
          Partage ton avis !
        </h2>

        <div>
          <h2 className="text-4xl font-extrabold">5 / 5</h2>
          <p>144 reviews</p>
        </div>
        <div className="size-full columns-1 md:columns-2 lg:columns-3">
          {reviews.map((r) => (
            <ReviewItem
              review={r}
              className="mb-8 break-inside-avoid-column"
              key={r.id}
            />
          ))}
        </div>
      </Section>
    </>
  );
};

const reviews: Review[] = [
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    audio: null,
    id: "1",
    image: "",
    ip: "",
    name: "John Doe",
    productId: "co-sport.com",
    rating: 5,
    socialLink: "",
    socialType: "LINKEDIN",
    text: "J'ai trouvé un super partenaire pour mes séances de course à pied. On se motive mutuellement, c'est génial !",
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    audio: null,
    id: "2",
    image: "",
    ip: "",
    name: "Emily Rivera",
    productId: "co-sport.com",
    rating: 4,
    socialLink: "",
    socialType: "LINKEDIN",
    text: "Super expérience, j'ai rencontré quelqu'un pour faire du yoga ensemble. C'est plus motivant à deux !",
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    audio: null,
    id: "3",
    image: "",
    ip: "",
    name: "Michael Chen",
    productId: "co-sport.com",
    rating: 5,
    socialLink: "",
    socialType: "TWITTER",
    text: "Faire du sport à plusieurs, c'est vraiment plus fun. Merci Co-Sport !",
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    audio: null,
    id: "4",
    image: "",
    ip: "",
    name: "Sofia Patel",
    productId: "co-sport.com",
    rating: 3,
    socialLink: "",
    socialType: "LINKEDIN",
    text: "Grâce à Co-Sport, j'ai un partenaire de fitness avec qui je m'entraîne régulièrement. Ça change tout !",
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    audio: null,
    id: "5",
    image: "",
    ip: "",
    name: "Alex Johnson",
    productId: "co-sport.com",
    rating: 5,
    socialLink: "",
    socialType: "LINKEDIN",
    text: "Je me sens en meilleure forme depuis que je m'entraîne avec un partenaire trouvé sur ce site.",
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    audio: null,
    id: "6",
    image: "",
    ip: "",
    name: "John Doe",
    productId: "co-sport.com",
    rating: 5,
    socialLink: "",
    socialType: "LINKEDIN",
    text: "Co-Sport m'a permis de rencontrer quelqu'un près de chez moi pour faire des séances de musculation. Top !",
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    audio: null,
    id: "7",
    image: "",
    ip: "",
    name: "Emily Rivera",
    productId: "co-sport.com",
    rating: 4,
    socialLink: "",
    socialType: "LINKEDIN",
    text: "Les avis m'ont beaucoup aidé à choisir un partenaire d'entraînement. Super service.",
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    audio: null,
    id: "8",
    image: "",
    ip: "",
    name: "Michael Chen",
    productId: "co-sport.com",
    rating: 5,
    socialLink: "",
    socialType: "TWITTER",
    text: "Le site est facile à utiliser et j'ai trouvé quelqu'un pour faire du vélo avec moi. Je recommande !",
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    audio: null,
    id: "9",
    image: "",
    ip: "",
    name: "Sofia Patel",
    productId: "co-sport.com",
    rating: 3,
    socialLink: "",
    socialType: "LINKEDIN",
    text: "Très satisfait de mon partenaire d'entraînement. On se motive et on progresse ensemble.",
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    audio: null,
    id: "10",
    image: "",
    ip: "",
    name: "Alex Johnson",
    productId: "co-sport.com",
    rating: 5,
    socialLink: "",
    socialType: "LINKEDIN",
    text: "Bonne plateforme, j'ai pu trouver un partenaire de sport qui me correspond parfaitement.",
  },
];