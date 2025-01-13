import { Membership, Product } from "@prisma/client";
import { z } from "zod";
import {
  LEVEL_CLASSES,
  SPORT_CLASSES,
} from "../[productId]/edit/product.schema";

export interface ProductWithMemberships extends Product {
  memberships: Membership[];
}

export interface ProductListProps {
  products: ProductWithMemberships[];
  userId: string;
}

export interface ProductFiltersProps {
  onFilterChange: (filters: FilterType) => void;
  filters: FilterType;
  className?: string;
  showGenderFilter?: boolean;
}

export interface FilteredProductListProps {
  products: ProductWithMemberships[];
  userSex: string | null;
  userId: string;
  users: { id: string; sex: string | null }[];
}
export interface ProductListParams {
  page?: string;
  sport?: string;
  level?: string;
  onlyGirls?: string;
}

export const FilterSchema = z.object({
  sport: z.enum(SPORT_CLASSES as [string, ...string[]]).optional(),
  level: z.enum(LEVEL_CLASSES as [string, ...string[]]).optional(),
  onlyGirls: z.boolean().optional(),
  location: z
    .object({
      name: z.string(),
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
});

export type FilterType = z.infer<typeof FilterSchema>;
