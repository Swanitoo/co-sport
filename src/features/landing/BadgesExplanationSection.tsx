import { BADGES } from "@/components/ui/badges/badge.config";
import Image from "next/image";

export const BadgesExplanationSection = () => {
  return (
    <section className="py-12" id="badges">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Les Badges Sportifs
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-xl text-gray-500 dark:text-gray-400 sm:mt-4">
            Distingues-toi grâce à nos badges sportifs qui reconnaissent tes
            accomplissements sur Strava
          </p>
        </div>

        <div className="mt-12">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {BADGES.map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-primary/50 dark:bg-black"
              >
                <div className="mb-5 flex items-center">
                  <div className="relative mr-4 size-14 shrink-0 rounded-full bg-primary/10 p-2">
                    <Image
                      src={badge.icon}
                      alt={badge.name}
                      fill
                      className="p-2"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {badge.name}
                  </h3>
                </div>
                <p className="mb-4 text-gray-600 dark:text-gray-400">
                  {badge.description}
                </p>
                <div className="mt-auto">
                  <div className="rounded-md bg-gray-100 p-4 dark:bg-gray-700">
                    <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Comment l'obtenir :
                    </h4>
                    <ul className="list-inside list-disc text-sm text-gray-600 dark:text-gray-400">
                      {badge.id === "profil-sportif" && (
                        <li>Pratiquer régulièrement (au moins 10 activités)</li>
                      )}
                      {badge.id === "montagnard" && (
                        <li>Cumuler plus de 1000m de dénivelé positif</li>
                      )}
                      {badge.id === "endurant" && (
                        <>
                          <li>Courir à moins de 6 min/km sur terrain plat</li>
                          <li>Ou moins de 7min30/km avec dénivelé</li>
                        </>
                      )}
                      {badge.id === "longue-distance" && (
                        <li>Réaliser au moins une course de plus de 15 km</li>
                      )}
                      {badge.id === "multi-sport" && (
                        <li>
                          Pratiquer au moins 3 disciplines sportives différentes
                        </li>
                      )}
                      {badge.id === "traileur" && (
                        <li>
                          Participer à au moins 5 activités de trail ou
                          randonnée
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
