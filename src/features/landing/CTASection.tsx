"use client";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Section } from "./Section";

// Type pour les traductions passées en props
type CTASectionProps = {
  translations?: {
    cta_button: string;
  };
};

export const CTASection = ({ translations }: CTASectionProps = {}) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Valeurs par défaut au cas où les traductions ne sont pas fournies
  const defaultTranslations = {
    cta_button: "Commencer",
  };

  // Utiliser les traductions fournies ou les valeurs par défaut
  const t = translations || defaultTranslations;

  const handleButtonClick = () => {
    if (status === "authenticated") {
      router.push("/products");
    } else {
      signIn();
    }
  };

  return (
    <Section>
      <Card className="flex flex-col items-center justify-center gap-4 p-6">
        <h2 className="text-center text-2xl font-bold">{t.cta_button}</h2>
        <button
          className={buttonVariants({ size: "lg" })}
          onClick={handleButtonClick}
        >
          {t.cta_button}
        </button>
      </Card>
    </Section>
  );
};
