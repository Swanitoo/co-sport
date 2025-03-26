import { locales } from "@/../locales";
import { currentUser } from "@/auth/current-user";
import { unstable_setRequestLocale } from "next-intl/server";
import LocalizedHomePage from "./home/page";

// Définir le type Locale localement
type Locale = (typeof locales)[number];

type Props = {
  params: Promise<{ locale: Locale }>;
};

export default async function LocalizedIndex(props: Props) {
  const params = await props.params;
  // Activer la locale pour cette requête
  unstable_setRequestLocale(params.locale);

  const user = await currentUser();

  // Ne pas rediriger les utilisateurs connectés - ils peuvent voir la page d'accueil
  // Les utilisateurs pourront toujours naviguer vers le dashboard via le menu

  // Passer les paramètres à la page d'accueil localisée en les transformant en Promise
  return <LocalizedHomePage params={Promise.resolve(params)} />;
}
