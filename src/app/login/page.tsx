import { PageParams } from "@/types/next";
import { redirect } from "next/navigation";
import { defaultLocale } from "../../../locales";

export default async function LoginRedirect(props: PageParams) {
  // Récupérer et attendre les paramètres de recherche
  const searchParams = await props.searchParams;

  // Convertir les paramètres de recherche en chaîne de requête
  const queryString = Object.entries(searchParams)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map((v) => `${key}=${encodeURIComponent(v)}`).join("&");
      }
      return `${key}=${encodeURIComponent(value || "")}`;
    })
    .join("&");

  // Construire l'URL de redirection avec la locale par défaut
  const redirectUrl = `/${defaultLocale}/login${
    queryString ? `?${queryString}` : ""
  }`;

  // Rediriger vers la page login localisée
  redirect(redirectUrl);
}
