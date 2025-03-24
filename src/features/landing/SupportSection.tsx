"use client";

import { Button } from "@/components/ui/button";
import { Handshake } from "lucide-react";
import Link from "next/link";

export const SupportSection = () => {
  return (
    <section className="py-12" id="support">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Soutenez co-sport.com
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-gray-500 dark:text-gray-400">
            Un projet indépendant au service de la communauté sportive
          </p>
        </div>

        {/* Version mobile : une colonne */}
        <div className="space-y-6 lg:hidden">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-primary/50 dark:bg-black">
            <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
              Notre histoire
            </h3>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <p>
                co-sport.com est né d'une passion pour le sport et d'une vision
                : créer une communauté inclusive où chacun peut trouver son
                partenaire sportif idéal.
              </p>
              <p>
                Développé par un unique développeur passionné, ce projet vise à
                rendre le sport plus accessible et plus sûr pour tous.
              </p>
              <p>
                À ce jour, co-sport.com reste entièrement{" "}
                <span className="font-semibold text-primary">gratuit</span>.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-primary/50 dark:bg-black">
            <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
              Comment nous soutenir
            </h3>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Pour maintenir ce service et continuer à développer de nouvelles
              fonctionnalités :
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
                    <span>Devenir partenaire</span>
                  </div>
                </Button>
              </Link>
            </div>

            <p className="mt-3 text-xs italic text-gray-500 dark:text-gray-400">
              À l'avenir, co-sport.com pourrait intégrer des publicités ciblées
              et non-intrusives ou des partenariats pour maintenir le service.
            </p>
          </div>
        </div>

        {/* Version desktop : deux colonnes */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Histoire et mission */}
          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-primary/50 dark:bg-black">
            <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Notre histoire
            </h3>
            <div className="space-y-4 text-gray-600 dark:text-gray-400">
              <p>
                co-sport.com est né d'une passion pour le sport et d'une vision
                : créer une communauté inclusive où chacun peut trouver son
                partenaire sportif idéal.
              </p>
              <p>
                Développé par un unique développeur passionné, ce projet est
                construit avec l'ambition de rendre le sport plus accessible et
                plus sûr pour tous, particulièrement pour les femmes qui
                souhaitent pratiquer en toute sécurité.
              </p>
              <p>
                À ce jour, co-sport.com reste entièrement{" "}
                <span className="font-semibold text-primary">gratuit</span> pour
                tous les utilisateurs. Notre priorité est de construire une
                communauté solide avant tout.
              </p>
            </div>
          </div>

          {/* Options de soutien */}
          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-primary/50 dark:bg-black">
            <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Comment nous soutenir
            </h3>
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-gray-600 dark:text-gray-400">
                  Pour maintenir ce service et continuer à développer de
                  nouvelles fonctionnalités, nous comptons sur le soutien de
                  notre communauté. Voici comment vous pouvez contribuer :
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
                      <span>Devenir partenaire</span>
                    </div>
                  </Button>
                </Link>
              </div>

              <p className="mt-4 text-sm italic text-gray-500 dark:text-gray-400">
                À l'avenir, co-sport.com pourrait intégrer des publicités
                ciblées et non-intrusives ou des partenariats pour maintenir le
                service, mais nous nous engageons à toujours proposer une
                expérience de qualité.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
