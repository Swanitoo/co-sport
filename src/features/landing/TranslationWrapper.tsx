"use client";

import { NextIntlClientProvider } from "next-intl";
import { ReactNode } from "react";

type TranslationWrapperProps = {
  locale: string;
  messages: Record<string, any>;
  children: ReactNode;
};

// Ce composant est un simple wrapper pour NextIntlClientProvider
// qui permet de transmettre les traductions aux composants clients
export const TranslationWrapper = ({
  locale,
  messages,
  children,
}: TranslationWrapperProps) => {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
};
