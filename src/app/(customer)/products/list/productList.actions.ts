"use server";

import { prisma } from "@/prisma";
import { FilterType } from "./productList.schema";

export async function getFilteredProducts(
  filters: FilterType,
  userSex?: string | null
) {
  // Préparer les conditions de filtre pour l'utilisateur
  const userFilter: any = {};

  // Filtre de pays
  if (filters.countries?.length > 0) {
    userFilter.country = {
      in: filters.countries,
    };
  }

  const where: any = {
    AND: [
      // Condition de base pour les annonces "only girls"
      {
        OR: [
          { onlyGirls: false }, // Toujours montrer les annonces non "only girls"
          {
            AND: [
              { onlyGirls: true },
              { user: { sex: "F" } }, // L'annonce doit être créée par une femme
              userSex === "F" ? {} : { id: "none" }, // Ne pas montrer aux hommes
            ],
          },
        ],
      },
    ],
  };

  // Ajouter les filtres communs
  if (filters.sport) {
    where.AND.push({ sport: filters.sport });
  }

  if (filters.venue) {
    where.AND.push({
      OR: [{ venueName: filters.venue }, { venueAddress: filters.venue }],
    });
  }

  if (filters.level) {
    where.AND.push({ level: filters.level });
  }

  // Ajouter le filtre pour les badges requis
  if (filters.requiredBadges && filters.requiredBadges.length > 0) {
    // Obtenir tous les utilisateurs qui ont complété les badges requis
    const badgeCompletions = await prisma.userBadge.findMany({
      where: {
        badgeId: {
          in: filters.requiredBadges,
        },
        completedAt: {
          not: undefined,
        },
      },
      select: {
        userId: true,
        badgeId: true,
      },
    });

    // Organiser les badges par utilisateur
    const userBadges: { [userId: string]: Set<string> } = {};

    badgeCompletions.forEach((completion) => {
      if (!userBadges[completion.userId]) {
        userBadges[completion.userId] = new Set();
      }
      userBadges[completion.userId].add(completion.badgeId);
    });

    // Trouver les utilisateurs qui ont tous les badges requis
    const userIds = Object.entries(userBadges)
      .filter(([userId, badges]) => {
        // Vérifier si l'utilisateur possède AU MOINS UN des badges requis (comme le filtre "only girls")
        return filters.requiredBadges!.some((badgeId) => badges.has(badgeId));
      })
      .map(([userId]) => userId);

    // Filtrer pour ne montrer que les annonces créées par ces utilisateurs
    if (userIds.length > 0) {
      where.AND.push({
        userId: {
          in: userIds,
        },
      });
    } else {
      // Si aucun utilisateur n'a les badges requis, ne renvoyer aucun résultat
      where.AND.push({ id: "none" });
    }
  }

  // Ajouter le filtre utilisateur combiné s'il y a des conditions
  if (Object.keys(userFilter).length > 0) {
    where.AND.push({ user: userFilter });
  }

  return await prisma.product.findMany({
    where,
    include: {
      memberships: true,
      user: {
        select: {
          id: true,
          sex: true,
          country: true,
          name: true,
          image: true,
          stravaRunningPace: true,
          stravaCyclingSpeed: true,
          stravaAvgDistance: true,
          stravaItraPoints: true,
        },
      },
    },
  });
}

export async function getUniqueVenues() {
  const venues = await prisma.product.findMany({
    where: {
      OR: [{ venueName: { not: null } }, { venueAddress: { not: null } }],
    },
    select: {
      venueName: true,
      venueAddress: true,
    },
    distinct: ["venueName", "venueAddress"],
  });

  return venues.filter((venue) => venue.venueName || venue.venueAddress);
}

export async function fetchMoreProducts(
  skip: number,
  filters: FilterType,
  userSex: string | null | undefined
) {
  // Préparer les conditions de filtre pour l'utilisateur
  const userFilter: any = {};

  // Filtre pour "only girls"
  if (filters.onlyGirls && userSex === "F") {
    userFilter.sex = "F";
  }

  // Filtre de pays
  if (filters.countries?.length > 0) {
    userFilter.country = {
      in: filters.countries,
    };
  }

  // Les filtres relatifs à l'allure, vitesse et distance ont été supprimés
  // car nous utilisons maintenant les badges pour ces performances

  const where: any = {
    AND: [
      // Si c'est un homme, on exclut les annonces onlyGirls
      {
        OR: [
          { onlyGirls: false },
          {
            AND: [
              { onlyGirls: true },
              { user: { sex: "F" } },
              userSex === "F" ? {} : { id: "none" },
            ],
          },
        ],
      },
    ],
  };

  // Ajouter les filtres communs
  if (filters.sport) {
    where.AND.push({ sport: filters.sport });
  }

  if (filters.venue) {
    where.AND.push({
      OR: [{ venueName: filters.venue }, { venueAddress: filters.venue }],
    });
  }

  if (filters.level) {
    where.AND.push({ level: filters.level });
  }

  // Ajouter le filtre pour les badges requis
  if (filters.requiredBadges && filters.requiredBadges.length > 0) {
    // Obtenir tous les utilisateurs qui ont complété les badges requis
    const badgeCompletions = await prisma.userBadge.findMany({
      where: {
        badgeId: {
          in: filters.requiredBadges,
        },
        completedAt: {
          not: undefined,
        },
      },
      select: {
        userId: true,
        badgeId: true,
      },
    });

    // Organiser les badges par utilisateur
    const userBadges: { [userId: string]: Set<string> } = {};

    badgeCompletions.forEach((completion) => {
      if (!userBadges[completion.userId]) {
        userBadges[completion.userId] = new Set();
      }
      userBadges[completion.userId].add(completion.badgeId);
    });

    // Trouver les utilisateurs qui ont tous les badges requis
    const userIds = Object.entries(userBadges)
      .filter(([userId, badges]) => {
        // Vérifier si l'utilisateur possède AU MOINS UN des badges requis (comme le filtre "only girls")
        return filters.requiredBadges!.some((badgeId) => badges.has(badgeId));
      })
      .map(([userId]) => userId);

    // Filtrer pour ne montrer que les annonces créées par ces utilisateurs
    if (userIds.length > 0) {
      where.AND.push({
        userId: {
          in: userIds,
        },
      });
    } else {
      // Si aucun utilisateur n'a les badges requis, ne renvoyer aucun résultat
      where.AND.push({ id: "none" });
    }
  }

  // Ajouter le filtre utilisateur combiné s'il y a des conditions
  if (Object.keys(userFilter).length > 0) {
    where.AND.push({ user: userFilter });
  }

  return await prisma.product.findMany({
    where,
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    skip,
    take: 10,
    include: {
      memberships: true,
      user: {
        select: {
          id: true,
          sex: true,
          country: true,
          name: true,
          image: true,
          stravaRunningPace: true,
          stravaCyclingSpeed: true,
          stravaAvgDistance: true,
          stravaItraPoints: true,
        },
      },
    },
  });
}
