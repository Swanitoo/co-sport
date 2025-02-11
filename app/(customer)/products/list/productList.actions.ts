"use server";

import { prisma } from "@/prisma";
import { FilterType } from "./productList.schema";

export async function getFilteredProducts(filters: FilterType, userSex?: string | null) {
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
              userSex === "F" ? {} : { id: "none" } // Ne pas montrer aux hommes
            ]
          }
        ]
      }
    ]
  };

  // Ajouter les autres filtres
  if (filters.sport) {
    where.AND.push({ sport: filters.sport });
  }

  if (filters.venue) {
    where.AND.push({
      OR: [
        { venueName: filters.venue },
        { venueAddress: filters.venue }
      ]
    });
  }

  if (filters.level) {
    where.AND.push({ level: filters.level });
  }

  if (filters.countries.length > 0) {
    where.AND.push({
      user: {
        country: {
          in: filters.countries
        }
      }
    });
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

export async function fetchMoreProducts(skip: number, filters: FilterType) {
  const where: any = {
    OR: [
      { onlyGirls: false },
      {
        onlyGirls: true,
        user: { sex: "F" },
      },
    ],
  };

  // Ajouter les filtres existants
  if (filters.sport) where.sport = filters.sport;
  if (filters.level) where.level = filters.level;
  if (filters.onlyGirls) where.user = { ...where.user, sex: "F" };
  if (filters.countries.length > 0) {
    where.user = { ...where.user, country: { in: filters.countries } };
  }

  return await prisma.product.findMany({
    where,
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
        },
      },
    },
  });
}
