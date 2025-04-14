import { getServerUrl } from "@/get-server-url";
import { prisma } from "@/prisma";
import { MetadataRoute } from "next";

// Génération dynamique du sitemap
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getServerUrl();

  // Pages statiques
  const staticPages = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/support`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
  ];

  // Récupérer les produits actifs
  const products = await prisma.product.findMany({
    where: {
      enabled: true,
    },
    select: {
      id: true,
      slug: true,
      name: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 1000, // Limiter pour les gros sites
  });

  // Récupérer les profils utilisateurs actifs
  const users = await prisma.user.findMany({
    where: {
      // Uniquement les utilisateurs qui ont des produits
      products: {
        some: {
          enabled: true,
        },
      },
    },
    select: {
      id: true,
      updatedAt: true,
    },
    take: 1000, // Limiter pour les gros sites
  });

  // Transformer les produits en entrées de sitemap
  const productPages = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Transformer les utilisateurs en entrées de sitemap
  const userPages = users.map((user) => ({
    url: `${baseUrl}/profile/${user.id}`,
    lastModified: user.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Combiner toutes les entrées
  return [...staticPages, ...productPages, ...userPages];
}
