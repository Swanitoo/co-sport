import { z } from "zod";

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
  onlyGirls: z.boolean().default(false),
  venueName: z.string().optional(),
  venueAddress: z.string().optional(),
  venueLat: z.number().optional(),
  venueLng: z.number().optional(),
});

export type ProductType = z.infer<typeof ProductSchema>;

export const LEVEL_CLASSES = [
  { name: "Débutant", icon: "🌱" },
  { name: "Intermédiaire", icon: "⭐" },
  { name: "Avancé", icon: "🌟" },
  { name: "Expert", icon: "💫" },
  { name: "Pro (Coatch, Entraîneur, Guide..)", icon: "👑" },
] as const;

export const MembershipSchema = z.object({
  userId: z.string(),
  productId: z.string(),
  comment: z.string().optional().nullable(),
  status: z.enum(["PENDING", "APPROVED", "REFUSED", "REMOVED"]),
});

export type MembershipType = z.infer<typeof MembershipSchema>;

export const SPORTS = [
  { name: "Alpinisme", icon: "🏔️" },
  { name: "Athlétisme", icon: "🏃" },
  { name: "Badminton", icon: "🏸" },
  { name: "Basketball", icon: "🏀" },
  { name: "BMX", icon: "🚲" },
  { name: "Boxe", icon: "🥊" },
  { name: "Danse", icon: "💃" },
  { name: "Escalade", icon: "🧗" },
  { name: "Football", icon: "⚽" },
  { name: "Kayak", icon: "🛶" },
  { name: "Musculation", icon: "🏋️" },
  { name: "Natation", icon: "🏊" },
  { name: "Paddle", icon: "🏄" },
  { name: "Plongée", icon: "🤿" },
  { name: "Randonnée", icon: "🥾" },
  { name: "Roller", icon: "⛸️" },
  { name: "Ski", icon: "⛷️" },
  { name: "Skate", icon: "🛹" },
  { name: "Surf", icon: "🏄‍♂️" },
  { name: "Tennis", icon: "🎾" },
  { name: "Trail", icon: "🏃‍♂️" },
  { name: "Triathlon", icon: "🏊‍♂️" },
  { name: "Vélo de route", icon: "🚴" },
  { name: "Voleyball", icon: "🏐" },
  { name: "VTT", icon: "🚵" },
  { name: "Yoga", icon: "🧘" },
] as const;

export const MessageSchema = z.object({
  text: z.string().min(1, "Le message ne peut pas être vide"),
  productId: z.string(),
  replyToId: z.string().optional(),
});
