"use server";

import { prisma } from "@/prisma";
import { FilterType } from "./productList.schema";

export async function getFilteredProducts(filters: FilterType) {
  const where: any = {};

  if (filters.sport) {
    where.sport = filters.sport;
  }

  if (filters.venue) {
    where.OR = [{ venueName: filters.venue }, { venueAddress: filters.venue }];
  }

  if (filters.level) {
    where.level = filters.level;
  }

  const userWhere: any = {};

  if (filters.onlyGirls) {
    userWhere.sex = "F";
  }

  if (filters.countries.length > 0) {
    userWhere.country = {
      in: filters.countries,
    };
  }

  if (Object.keys(userWhere).length > 0) {
    where.user = {
      ...userWhere,
    };
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
        },
      },
    },
  });
}
