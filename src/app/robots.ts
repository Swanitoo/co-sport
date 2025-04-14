import { getServerUrl } from "@/get-server-url";
import { MetadataRoute } from "next";

/**
 * Configuration des robots.txt pour le contrôle du crawling
 * Cette fonction génère dynamiquement le fichier robots.txt
 */
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
          "/api/",
          "/dashboard/",
          "/login/",
          "/admin/",
          "/success/",
          "/cancel/",
          "/r/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
