import { BADGES } from "@/components/ui/badges/badge.config";
import { useTranslations } from "next-intl";
import Image from "next/image";

export const LocalizedBadgesExplanationSection = () => {
  const t = useTranslations("Home.Badges");

  return (
    <section className="py-12" id="badges">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h3 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {t("title")}
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-xl text-gray-500 dark:text-gray-400 sm:mt-4">
            {t("subtitle")}
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
                      alt={getBadgeTitle(badge.id, t)}
                      fill
                      className="p-2"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {getBadgeTitle(badge.id, t)}
                  </h3>
                </div>
                <p className="mb-4 text-gray-600 dark:text-gray-400">
                  {getBadgeDescription(badge.id, t)}
                </p>
                <div className="mt-auto">
                  <div className="rounded-md bg-gray-100 p-4 dark:bg-gray-700">
                    <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      {t("how_to_get")}
                    </h4>
                    <ul className="list-inside list-disc text-sm text-gray-600 dark:text-gray-400">
                      {badge.id === "profil-sportif" && (
                        <li>{t("profile_req")}</li>
                      )}
                      {badge.id === "montagnard" && (
                        <li>{t("mountain_req")}</li>
                      )}
                      {badge.id === "endurant" && (
                        <>
                          <li>{t("endurance1_req")}</li>
                          <li>{t("endurance2_req")}</li>
                        </>
                      )}
                      {badge.id === "longue-distance" && (
                        <li>{t("long_distance_req")}</li>
                      )}
                      {badge.id === "multi-sport" && (
                        <li>{t("multi_sport_req")}</li>
                      )}
                      {badge.id === "traileur" && <li>{t("trail_req")}</li>}
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

// Fonction d'aide pour obtenir le titre du badge traduit
function getBadgeTitle(badgeId: string, t: (key: string) => string): string {
  switch (badgeId) {
    case "profil-sportif":
      return t("profile.title");
    case "montagnard":
      return t("mountain.title");
    case "endurant":
      return t("endurance.title");
    case "longue-distance":
      return t("long_distance.title");
    case "multi-sport":
      return t("multi_sport.title");
    case "traileur":
      return t("trail.title");
    default:
      return badgeId;
  }
}

// Fonction d'aide pour obtenir la description du badge traduite
function getBadgeDescription(
  badgeId: string,
  t: (key: string) => string
): string {
  switch (badgeId) {
    case "profil-sportif":
      return t("profile.description");
    case "montagnard":
      return t("mountain.description");
    case "endurant":
      return t("endurance.description");
    case "longue-distance":
      return t("long_distance.description");
    case "multi-sport":
      return t("multi_sport.description");
    case "traileur":
      return t("trail.description");
    default:
      return "";
  }
}
