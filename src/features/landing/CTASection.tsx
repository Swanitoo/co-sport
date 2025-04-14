"use client";

import { useAppTranslations } from "@/components/i18n-provider";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Loader2, Rocket } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Section } from "./Section";

type CTASectionProps = {
  translations: {
    cta_button: string;
  };
};

export const CTASection = ({ translations }: CTASectionProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useAppTranslations();
  const [isLoading, setIsLoading] = useState(false);

  const handleButtonClick = () => {
    setIsLoading(true);

    if (status === "authenticated") {
      router.push("/products");
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
