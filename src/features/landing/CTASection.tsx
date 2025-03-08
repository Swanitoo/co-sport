"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "./Section";

export const CTASection = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

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
        <h2 className="text-center text-2xl font-bold">
          Commence dès maintenant
        </h2>
        <button
          className={buttonVariants({ size: "lg" })}
          onClick={handleButtonClick}
        >
          Voir les annonces
        </button>
      </Card>
    </Section>
  );
};
