"use client";

import { buttonVariants } from "@/components/ui/button";
import { Section } from "./Section";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { CTASection } from "./CTASection";

export const HeroSection = () => {
  return (
    <Section className="text-center">
      <div
        className="mb-7  inline-flex items-center justify-between rounded-full bg-accent/50 p-1 pr-4 text-sm text-card-foreground hover:bg-accent"
        role="alert"
      >
        <span className="mr-3 rounded-full bg-primary px-4 py-1.5 text-xs text-primary-foreground">
          Prochainement
        </span>{" "}
        <span className="text-sm font-medium">
          L'application mobile
        </span>
      </div>
      <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-foreground  md:text-5xl lg:text-6xl">
        Trouve ton partenaire de sport
      </h1>
      <p className="mb-8 text-lg font-normal text-muted-foreground sm:px-16 lg:text-xl xl:px-48">
      Choisis ton sport, trouve ton partenaire idéal et progressez ensemble tout en sociabilisant.
      </p>
      <div className="mb-8 flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-x-4 sm:space-y-0 lg:mb-16">
      <CTASection />
        {/* <a
          href="#"
          className={buttonVariants({
            size: "lg",
            variant: "secondary",
          })}
        >
          <svg
            className="-ml-1 mr-2 size-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"></path>
          </svg>
          Watch video
        </a> */}
      </div>
      
    </Section>
  );
};