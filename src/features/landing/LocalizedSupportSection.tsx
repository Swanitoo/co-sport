"use client";

import { Button } from "@/components/ui/button";
import { Handshake } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

export const LocalizedSupportSection = () => {
  const t = useTranslations("Home.Support");

  return (
    <section className="py-12" id="support">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h3 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {t("title")}
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-gray-500 dark:text-gray-400">
            {t("subtitle")}
          </p>
        </div>

        {/* Version mobile : une colonne */}
        <div className="space-y-6 lg:hidden">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-primary/50 dark:bg-black">
            <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
              {t("story")}
            </h3>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <p>{t("story_p1")}</p>
              <p>{t("story_p2")}</p>
              <p>
                {t("story_p3").split("gratuit")[0]}
                <span className="font-semibold text-primary">gratuit</span>
                {t("story_p3").split("gratuit")[1] || "."}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-primary/50 dark:bg-black">
            <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
              {t("how_to_support")}
            </h3>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              {t("support_p1")}
            </p>

            <div className="flex flex-col space-y-3">
              <div className="mb-2 flex justify-center">
                <a
                  href="https://www.buymeacoffee.com/swanmarin"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=swanmarin&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff"
                    alt="Buy Me A Coffee"
                    className="size-auto"
                  />
                </a>
              </div>

              <Link href="/support" className="inline-block w-full">
                <Button
                  className="w-full justify-between py-4 text-base"
                  variant="outline"
                >
                  <div className="flex items-center">
                    <Handshake className="mr-2 size-4" />
                    <span>{t("become_partner")}</span>
                  </div>
                </Button>
              </Link>
            </div>

            <p className="mt-3 text-xs italic text-gray-500 dark:text-gray-400">
              {t("future_p1")}
            </p>
          </div>
        </div>

        {/* Version desktop : deux colonnes */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Histoire et mission */}
          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-primary/50 dark:bg-black">
            <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              {t("story")}
            </h3>
            <div className="space-y-4 text-gray-600 dark:text-gray-400">
              <p>{t("story_p1")}</p>
              <p>{t("story_p2")}</p>
              <p>
                {t("story_p3").split("gratuit")[0]}
                <span className="font-semibold text-primary">gratuit</span>
                {t("story_p3").split("gratuit")[1] || "."}
              </p>
            </div>
          </div>

          {/* Options de soutien */}
          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-primary/50 dark:bg-black">
            <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              {t("how_to_support")}
            </h3>
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-gray-600 dark:text-gray-400">
                  {t("support_p1")}
                </p>
              </div>

              <div className="flex flex-col space-y-4">
                <div className="mb-2 flex justify-center">
                  <a
                    href="https://www.buymeacoffee.com/swanmarin"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=swanmarin&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff"
                      alt="Buy Me A Coffee"
                      className="size-auto"
                    />
                  </a>
                </div>

                <Link href="/support" className="inline-block w-full">
                  <Button
                    className="w-full justify-between p-5 text-lg"
                    variant="outline"
                  >
                    <div className="flex items-center">
                      <Handshake className="mr-3 size-5" />
                      <span>{t("become_partner")}</span>
                    </div>
                  </Button>
                </Link>
              </div>

              <p className="mt-4 text-sm italic text-gray-500 dark:text-gray-400">
                {t("future_p1")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
