import { optional, z } from "zod";

export const ProductSchema = z.object({
  name: z
    .string()
    .min(3, "Le nom doit comporter au moins 3 caractères")
    .max(30, "Le nom ne peut pas dépasser 30 caractères"),
  slug: z
    .string()
    .regex(/^[a-zA-Z0-9_-]*^/)
    .optional(),
  sport: z.string(),
  level: z.string(),
  description: z.string(),
});

export type ProductType = z.infer<typeof ProductSchema>;

export const LEVEL_CLASSES = ["Débutant", "Intermédiaire", "Avancé"];

export const MembershipSchema = z.object({
  userId: z.string(),
  productId: z.string(),
  comment: z.string().optional().nullable(),
  status: z.enum(["PENDING", "APPROVED", "REFUSED", "REMOVED"]),
});

export type MembershipType = z.infer<typeof MembershipSchema>;

export const SPORT_CLASSES = [
  "Alpinisme",
  "Athlétisme",
  "BMX",
  "Boxe",
  "Danse",
  "Escalade",
  "Football",
  "Kayak",
  "Musculation",
  "Natation",
  "Paddle",
  "Plongée",
  "Randonnée",
  "Roller",
  "Ski",
  "Skate",
  "Surf",
  "Tennis",
  "Trail",
  "Triathlon",
  "Vélo de route",
  "Voleyball",
  "VTT",
  "Yoga",
];
