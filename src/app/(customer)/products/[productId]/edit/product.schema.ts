import { z } from "zod";

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
  { name: "Paintball", icon: "🎯" },
  { name: "Pétanque", icon: "⚫" },
  { name: "Plongée", icon: "🤿" },
  { name: "Randonnée", icon: "🥾" },
  { name: "Roller", icon: "⛸️" },
  { name: "Ski", icon: "⛷️" },
  { name: "Skate", icon: "🛹" },
  { name: "Surf", icon: "🏄‍♂️" },
  { name: "Tennis", icon: "🎾" },
  { name: "Trail", icon: "🏃‍♂️" },
  { name: "Trek", icon: "🥾" },
  { name: "Triathlon", icon: "🏊‍♂️" },
  { name: "Vélo de route", icon: "🚴" },
  { name: "Voleyball", icon: "🏐" },
  { name: "VTT", icon: "🚵" },
  { name: "Yoga", icon: "🧘" },
] as const;

export const LEVEL_CLASSES = [
  { name: "Débutant", icon: "🌱" },
  { name: "Intermédiaire", icon: "⭐" },
  { name: "Avancé", icon: "🌟" },
  { name: "Expert", icon: "💫" },
  { name: "Pro (Coatch, Entraîneur, Guide..)", icon: "👑" },
] as const;

export const ProductSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().min(1, "La description est requise"),
  sport: z.enum(SPORTS.map((s) => s.name) as [string, ...string[]], {
    errorMap: () => ({ message: "Veuillez sélectionner un sport" }),
  }),
  level: z.enum(LEVEL_CLASSES.map((l) => l.name) as [string, ...string[]], {
    errorMap: () => ({ message: "Veuillez sélectionner un niveau" }),
  }),
  venueName: z.string().optional(),
  venueAddress: z.string().optional(),
  venueLatitude: z.number().optional(),
  venueLongitude: z.number().optional(),
  onlyGirls: z.boolean().default(false),
});

export type ProductType = z.infer<typeof ProductSchema>;

export const generateSlug = (name: string, level: string) => {
  const slugBase = `${name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase()}-${level
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase()}`;
  return slugBase;
};

export const MembershipSchema = z.object({
  userId: z.string(),
  productId: z.string(),
  comment: z.string().optional().nullable(),
  status: z.enum(["PENDING", "APPROVED", "REFUSED", "REMOVED"]),
});

export type MembershipType = z.infer<typeof MembershipSchema>;

export const MessageSchema = z.object({
  text: z.string().min(1, "Le message ne peut pas être vide"),
  productId: z.string(),
  replyToId: z.string().optional(),
});
