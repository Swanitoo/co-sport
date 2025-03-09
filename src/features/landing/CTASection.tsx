"use client";

import { useAppTranslations } from "@/components/i18n-provider";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
        <button
          className={buttonVariants({ size: "lg" })}
          onClick={handleButtonClick}
        >
          {t("Home.cta_button")}
        </button>
      </Card>
    </Section>
  );
};
