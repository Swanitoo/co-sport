"use client";

import { useAppTranslations } from "@/components/i18n-provider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Section } from "./Section";

export const FAQSection = () => {
  const { t } = useAppTranslations();

  const FAQS = [
    {
      id: "faq-1",
      question: t("FAQ.Q1"),
      answer: t("FAQ.A1"),
    },
    {
      id: "faq-2",
      question: t("FAQ.Q2"),
      answer: t("FAQ.A2"),
    },
    {
      id: "faq-3",
      question: t("FAQ.Q3"),
      answer: t("FAQ.A3"),
    },
    {
      id: "faq-4",
      question: t("FAQ.Q4"),
      answer: t("FAQ.A4"),
    },
    {
      id: "faq-5",
      question: t("FAQ.Q5"),
      answer: t("FAQ.A5"),
    },
    {
      id: "faq-6",
      question: t("FAQ.Q6"),
      answer: t("FAQ.A6"),
    },
  ];

  return (
    <Section className="flex w-full flex-row items-start gap-4 max-lg:flex-col max-lg:items-center">
      <div className="flex-1 max-lg:text-center">
        <h2 className="text-3xl font-bold text-primary">{t("FAQ.Title")}</h2>
      </div>
      <div className="w-full max-w-lg flex-1 text-left">
        <Accordion type="multiple">
          {FAQS.map((faq) => (
            <AccordionItem value={faq.id} key={faq.id} className="text-left">
              <AccordionTrigger>
                <span className="text-left">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  );
};
