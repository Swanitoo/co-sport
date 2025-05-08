import { getServerUrl } from "@/get-server-url";
import { MetadataRoute } from "next";

// Configuration des robots.txt pour le contrôle du crawling
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getServerUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: "*",
        disallow: [
          // Routes système
          "/api/",

          // Routes d'authentification
          "/login/",

          // Routes de paiement
          "/success/",
          "/cancel/",

          // Routes privées non localisées
          "/profile/",
          "/profil/",
          "/dashboard/",
          "/r/",
          "/wall/",

          // Routes privées localisées (fr, en, es)
          "/fr/login/",
          "/en/login/",
          "/es/login/",

          "/fr/profile/",
          "/en/profile/",
          "/es/profile/",

          "/fr/profil/",
          "/en/profil/",
          "/es/profil/",

          "/fr/dashboard/",
          "/en/dashboard/",
          "/es/dashboard/",

          "/fr/r/",
          "/en/r/",
          "/es/r/",

          "/fr/wall/",
          "/en/wall/",
          "/es/wall/",

          "/fr/support/",
          "/en/support/",
          "/es/support/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
