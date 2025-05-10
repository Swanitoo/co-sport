"use client";

import { useNavigation } from "@/app/providers";
import { useAppTranslations } from "@/components/i18n-provider";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Loader2, Rocket } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Section } from "./Section";

type CTASectionProps = {
  translations: {
    cta_button: string;
  };
};

export const CTASection = ({ translations }: CTASectionProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, locale } = useAppTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const { startNavigation } = useNavigation();

  // Précharger la page d'annonces au chargement du composant
  useEffect(() => {
    // Précharge immédiatement la page d'annonces pour accélérer la transition
    router.prefetch(`/${locale}/annonces`);
  }, [router, locale]);

  const handleButtonClick = () => {
    setIsLoading(true);
    // Démarrer l'indicateur de navigation immédiatement
    startNavigation();

    if (status === "authenticated") {
      // Ajouter un court délai pour permettre l'affichage du loader
      setTimeout(() => {
        router.push("/annonces");
      }, 50);
    } else {
      signIn();
    }

    // Ajouter un délai minimal pour assurer la visibilité du loader
    // Ne sera visible que si la navigation/signin est plus rapide que ce délai
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  return (
    <Section>
      <Card className="flex flex-col items-center justify-center gap-4 p-6">
        <button
          className={buttonVariants({ size: "lg" })}
          onClick={handleButtonClick}
          disabled={isLoading}
          data-navigation="true"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              {t("Common.Loading", "Chargement...")}
            </>
          ) : (
            <>
              <Rocket className="mr-2 size-5" />
              {t("Home.cta_button")}
              <ArrowRight className="ml-2 size-5" />
            </>
          )}
        </button>
      </Card>
    </Section>
  );
};
