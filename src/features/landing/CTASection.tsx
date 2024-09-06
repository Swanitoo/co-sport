"use client";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "./Section";
import { signIn } from "next-auth/react";

export const CTASection = () => {
  return (
    <Section>
      <Card className="flex flex-col items-center justify-center gap-4 p-12 lg:p-20">
        <h2 className="text-3xl font-bold">Commencez dès maintenant</h2>
        <button
          className={buttonVariants({ size: "lg" })}
          onClick={() => signIn()}
        >
          Commence maintenant
        </button>
      </Card>
    </Section>
  );
};
