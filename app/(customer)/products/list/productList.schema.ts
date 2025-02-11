import { Membership, Product } from "@prisma/client";
import { z } from "zod";
import {
  LEVEL_CLASSES,
  SPORTS,
} from "../[productId]/edit/product.schema";

export interface ProductWithMemberships extends Product {
  memberships: Membership[];
  user: {
    id: string;
    sex: string | null;
    country: string | null;
    name: string | null;
    image: string | null;
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
}

export const FilterSchema = z.object({
  sport: z.enum(SPORTS.map(s => s.name) as [string, ...string[]]).optional(),
  level: z.enum(LEVEL_CLASSES.map(l => l.name) as [string, ...string[]]).optional(),
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
});

export type FilterType = z.infer<typeof FilterSchema>;

export interface ProductFiltersProps {
  onFilterChange: (filters: FilterType) => void;
  filters: FilterType;
  className?: string;
  showGenderFilter?: boolean;
}
