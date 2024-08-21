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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const FeatureSection = () => {
  const [step, setStep] = useState(0);

  return (
    <>
      <Section className="pb-2" id="features">
        <h2 className="text-center text-3xl font-bold">
          Le procéder est simple :
        </h2>
      </Section>
      <Section className="light rounded-lg bg-gradient-to-r from-red-500 to-orange-500 py-12 text-foreground shadow">
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
                  {`Choisis ta séance et ton partenaire`}
                </h2>
                <Table>
          <TableHeader>
            <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Sport</TableHead>
                <TableHead>Lieux</TableHead>
                <TableHead>Pratiquant</TableHead>
                <TableHead>Avis</TableHead>
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
                  Scéance biceps
                </TableCell>
                <TableCell className="font-mono">Musculation</TableCell>
                <TableCell className="font-mono">Onair Lyon 3</TableCell>
                <TableCell className="font-mono">Patoche</TableCell>
                <TableCell className="font-mono">
                  46
                </TableCell>
                
              </TableRow>
              <TableRow
          onClick={() => {
            setStep((s) => s + 1);
          }}
          className="cursor-pointer"
        >
                <TableCell>
                  Scéance boxe anglaise
                </TableCell>
                <TableCell className="font-mono">Boxe</TableCell>
                <TableCell className="font-mono">Club du Rhône</TableCell>
                <TableCell className="font-mono">Seb</TableCell>
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
                  Séssion alpinisme D+
                </TableCell>
                <TableCell className="font-mono">Alpinisme</TableCell>
                <TableCell className="font-mono">Mont cervin</TableCell>
                <TableCell className="font-mono">Fabrice</TableCell>
                <TableCell className="font-mono">
                  105
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
                <h2 className="text-lg font-bold">
                  {`Note ton partenaire`}
                </h2>
                <RatingSelector
                  onSelect={(review) => {
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
                  {"Laisse un avis détaillé avec ce que tu as aimé est moins aimé pendant la séance."}
                </h2>
                <ReviewTextSelector
                  onInputSend={(i) => {
                    setStep((s) => s + 1);
                  }}
                  productId={""}
                />
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
                  {"Et voilà !"}
                </h2>
                <Card>
                  <CardHeader>
                    <CardDescription>
                      Tu sais utiliser Co-sport ! ✅
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
          <p>22 reviews</p>
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
    name: "Jean Claude",
    productId: "co-sport.com",
    rating: 5,
    socialLink: "https://www.instagram.com/jcvd/",
    socialType: "LINKEDIN",
    text: "Co-Sport m'a permis de rencontrer quelqu'un près de chez moi pour faire des séances de musculation. Top !",
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    audio: null,
    id: "2",
    image: "",
    ip: "",
    name: "Emily",
    productId: "co-sport.com",
    rating: 4,
    socialLink: "https://www.instagram.com/emily_ratajkowski_official/",
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
    name: "Emmanuel",
    productId: "co-sport.com",
    rating: 5,
    socialLink: "https://www.instagram.com/emmanuelmacron/",
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
    name: "David",
    productId: "co-sport.com",
    rating: 3,
    socialLink: "https://www.instagram.com/davidguetta/",
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
    name: "Ali",
    productId: "co-sport.com",
    rating: 5,
    socialLink: "https://www.instagram.com/bigaliofficial/",
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
    name: "Kilian",
    productId: "co-sport.com",
    rating: 5,
    socialLink: "https://www.instagram.com/kilianjornet/",
    socialType: "LINKEDIN",
    text: "J'ai trouvé un super partenaire pour mes séances de course à pied. On se motive mutuellement, c'est génial !",
  },
];