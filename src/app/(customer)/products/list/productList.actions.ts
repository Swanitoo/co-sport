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

  // Filtre d'allure de course à pied
  if (filters.minRunPace !== undefined || filters.maxRunPace !== undefined) {
    userFilter.stravaRunningPace = { not: null };

    if (filters.minRunPace !== undefined) {
      userFilter.stravaRunningPace = {
        ...userFilter.stravaRunningPace,
        gte: filters.minRunPace,
      };
    }

    if (filters.maxRunPace !== undefined) {
      userFilter.stravaRunningPace = {
        ...userFilter.stravaRunningPace,
        lte: filters.maxRunPace,
      };
    }
  }

  // Filtre de vitesse à vélo
  if (
    filters.minCyclingSpeed !== undefined ||
    filters.maxCyclingSpeed !== undefined
  ) {
    userFilter.stravaCyclingSpeed = { not: null };

    if (filters.minCyclingSpeed !== undefined) {
      userFilter.stravaCyclingSpeed = {
        ...userFilter.stravaCyclingSpeed,
        gte: filters.minCyclingSpeed,
      };
    }

    if (filters.maxCyclingSpeed !== undefined) {
      userFilter.stravaCyclingSpeed = {
        ...userFilter.stravaCyclingSpeed,
        lte: filters.maxCyclingSpeed,
      };
    }
  }

  // Filtre de distance moyenne
  if (filters.minDistance !== undefined) {
    userFilter.stravaAvgDistance = {
      not: null,
      gte: filters.minDistance,
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

  // Filtre d'allure de course à pied
  if (filters.minRunPace !== undefined || filters.maxRunPace !== undefined) {
    userFilter.stravaRunningPace = { not: null };

    if (filters.minRunPace !== undefined) {
      userFilter.stravaRunningPace = {
        ...userFilter.stravaRunningPace,
        gte: filters.minRunPace,
      };
    }

    if (filters.maxRunPace !== undefined) {
      userFilter.stravaRunningPace = {
        ...userFilter.stravaRunningPace,
        lte: filters.maxRunPace,
      };
    }
  }

  // Filtre de vitesse à vélo
  if (
    filters.minCyclingSpeed !== undefined ||
    filters.maxCyclingSpeed !== undefined
  ) {
    userFilter.stravaCyclingSpeed = { not: null };

    if (filters.minCyclingSpeed !== undefined) {
      userFilter.stravaCyclingSpeed = {
        ...userFilter.stravaCyclingSpeed,
        gte: filters.minCyclingSpeed,
      };
    }

    if (filters.maxCyclingSpeed !== undefined) {
      userFilter.stravaCyclingSpeed = {
        ...userFilter.stravaCyclingSpeed,
        lte: filters.maxCyclingSpeed,
      };
    }
  }

  // Filtre de distance moyenne
  if (filters.minDistance !== undefined) {
    userFilter.stravaAvgDistance = {
      not: null,
      gte: filters.minDistance,
    };
  }

  const where: any = {
    AND: [
      // Si c'est un homme, on exclut les annonces onlyGirls
      userSex === "M" ? { onlyGirls: false } : {},
    ],
  };

  // Ajouter les filtres communs
  if (filters.sport) {
    where.AND.push({ sport: filters.sport });
  }

  if (filters.level) {
    where.AND.push({ level: filters.level });
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
