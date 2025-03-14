import { Membership, Product } from "@prisma/client";
import { z } from "zod";
import { LEVEL_CLASSES, SPORTS } from "../[productId]/edit/product.schema";

export interface ProductWithMemberships extends Product {
  memberships: Membership[];
  user: {
    id: string;
    sex: string | null;
    country: string | null;
    name: string | null;
    image: string | null;
    // Performances sportives
    stravaRunningPace?: number | null;
    stravaCyclingSpeed?: number | null;
    stravaAvgDistance?: number | null;
    stravaItraPoints?: number | null;
  };
}

export interface ProductListProps {
  products: ProductWithMemberships[];
  userId: string;
}

export interface FilteredProductListProps {
  initialProducts: ProductWithMemberships[];
  userSex: string | null;
  userId: string;
  venues: { venueName: string | null; venueAddress: string | null }[];
  isAdmin?: boolean;
  searchParams?: { [key: string]: string | string[] | undefined };
}

export const FilterSchema = z.object({
  sport: z.enum(SPORTS.map((s) => s.name) as [string, ...string[]]).optional(),
  level: z
    .enum(LEVEL_CLASSES.map((l) => l.name) as [string, ...string[]])
    .optional(),
  onlyGirls: z.boolean().default(false),
  countries: z.array(z.string()).default([]),
  venue: z.string().optional(),
  location: z
    .object({
      name: z.string(),
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
  // Nouveaux filtres de performance sportive
  minRunPace: z.number().optional(),
  maxRunPace: z.number().optional(),
  minCyclingSpeed: z.number().optional(),
  maxCyclingSpeed: z.number().optional(),
  minDistance: z.number().optional(),
  maxDistance: z.number().optional(),
  minItraPoints: z.number().optional(),
  maxItraPoints: z.number().optional(),
});

export type FilterType = z.infer<typeof FilterSchema>;

export interface ProductFiltersProps {
  onFilterChange: (filters: FilterType) => void;
  filters: FilterType;
  className?: string;
  showGenderFilter?: boolean;
}
