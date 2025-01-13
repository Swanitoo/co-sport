"use server";

import { prisma } from "@/prisma";
import { FilterType } from "./productList.schema";

export async function getFilteredProducts(filters: FilterType) {
  return await prisma.product.findMany({
    where: {
      sport: filters.sport,
      level: filters.level,
      ...(filters.onlyGirls && {
        user: {
          sex: "F",
        },
      }),
    },
    include: {
      memberships: true,
      user: {
        select: {
          id: true,
          sex: true,
        },
      },
    },
  });
}
