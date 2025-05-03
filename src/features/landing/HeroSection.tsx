"use client";

import { CTASection } from "./CTASection";
import { Section } from "./Section";

// Type pour les traductions passées en props
type HeroSectionProps = {
  translations: {
    soon: string;
    app_mobile: string;
    hero_title: string;
    hero_subtitle: string;
    cta_button: string;
  };
};

export const HeroSection = ({ translations }: HeroSectionProps) => {
  return (
    <Section className="text-center">
      <div
        className="mb-7  inline-flex items-center justify-between rounded-full bg-accent/50 p-1 pr-4 text-sm text-card-foreground hover:bg-accent"
        role="alert"
      >
        <span className="mr-3 rounded-full bg-primary px-4 py-1.5 text-xs text-primary-foreground">
          {translations.soon}
        </span>{" "}
        <span className="text-sm font-medium">{translations.app_mobile}</span>
      </div>
      <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-foreground  md:text-5xl lg:text-6xl">
        {translations.hero_title}
      </h1>
      <h3 className="mb-8 text-lg font-normal text-muted-foreground sm:px-16 lg:text-xl xl:px-48">
        {translations.hero_subtitle}
      </h3>
      <div className="mb-8 flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-x-4 sm:space-y-0 lg:mb-16">
        <CTASection translations={{ cta_button: translations.cta_button }} />
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
          {translations.cta_secondary}
        </a> */}
      </div>
    </Section>
  );
};
