import { z } from "zod";

export const SPORTS = [
  {
    name: "Alpinisme",
    icon: "🏔️",
    translations: { en: "Mountaineering", es: "Alpinismo" },
  },
  {
    name: "Athlétisme",
    icon: "🏃",
    translations: { en: "Athletics", es: "Atletismo" },
  },
  {
    name: "Badminton",
    icon: "🏸",
    translations: { en: "Badminton", es: "Bádminton" },
  },
  {
    name: "Basketball",
    icon: "🏀",
    translations: { en: "Basketball", es: "Baloncesto" },
  },
  { name: "BMX", icon: "🚲", translations: { en: "BMX", es: "BMX" } },
  { name: "Boxe", icon: "🥊", translations: { en: "Boxing", es: "Boxeo" } },
  { name: "Danse", icon: "💃", translations: { en: "Dance", es: "Baile" } },
  {
    name: "Escalade",
    icon: "🧗",
    translations: { en: "Climbing", es: "Escalada" },
  },
  {
    name: "Football",
    icon: "⚽",
    translations: { en: "Soccer", es: "Fútbol" },
  },
  { name: "Kayak", icon: "🛶", translations: { en: "Kayaking", es: "Kayak" } },
  {
    name: "Musculation",
    icon: "🏋️",
    translations: { en: "Weightlifting", es: "Musculación" },
  },
  {
    name: "Natation",
    icon: "🏊",
    translations: { en: "Swimming", es: "Natación" },
  },
  { name: "Paddle", icon: "🏄", translations: { en: "Paddle", es: "Paddle" } },
  {
    name: "Paintball",
    icon: "🎯",
    translations: { en: "Paintball", es: "Paintball" },
  },
  {
    name: "Pétanque",
    icon: "⚫",
    translations: { en: "Petanque", es: "Petanca" },
  },
  { name: "Plongée", icon: "🤿", translations: { en: "Diving", es: "Buceo" } },
  {
    name: "Randonnée",
    icon: "🥾",
    translations: { en: "Hiking", es: "Senderismo" },
  },
  {
    name: "Roller",
    icon: "⛸️",
    translations: { en: "Roller skating", es: "Patinaje" },
  },
  { name: "Ski", icon: "⛷️", translations: { en: "Skiing", es: "Esquí" } },
  {
    name: "Skate",
    icon: "🛹",
    translations: { en: "Skateboarding", es: "Skateboarding" },
  },
  { name: "Surf", icon: "🏄‍♂️", translations: { en: "Surfing", es: "Surf" } },
  { name: "Tennis", icon: "🎾", translations: { en: "Tennis", es: "Tenis" } },
  {
    name: "Trail",
    icon: "🏃‍♂️",
    translations: { en: "Trail running", es: "Trail running" },
  },
  {
    name: "Trek",
    icon: "🥾",
    translations: { en: "Trekking", es: "Trekking" },
  },
  {
    name: "Triathlon",
    icon: "🏊‍♂️",
    translations: { en: "Triathlon", es: "Triatlón" },
  },
  {
    name: "Vélo de route",
    icon: "🚴",
    translations: { en: "Road cycling", es: "Ciclismo de ruta" },
  },
  {
    name: "Voleyball",
    icon: "🏐",
    translations: { en: "Volleyball", es: "Voleibol" },
  },
  {
    name: "VTT",
    icon: "🚵",
    translations: { en: "Mountain biking", es: "BTT" },
  },
  { name: "Yoga", icon: "🧘", translations: { en: "Yoga", es: "Yoga" } },
] as const;

export const LEVEL_CLASSES = [
  {
    name: "Débutant",
    icon: "🌱",
    translations: { en: "Beginner", es: "Principiante" },
  },
  {
    name: "Intermédiaire",
    icon: "⭐",
    translations: { en: "Intermediate", es: "Intermedio" },
  },
  {
    name: "Avancé",
    icon: "🌟",
    translations: { en: "Advanced", es: "Avanzado" },
  },
  { name: "Expert", icon: "💫", translations: { en: "Expert", es: "Experto" } },
  {
    name: "Pro (Coatch, Entraîneur, Guide..)",
    icon: "👑",
    translations: {
      en: "Pro (Coach, Trainer, Guide..)",
      es: "Pro (Entrenador, Guía..)",
    },
  },
] as const;

// Type pour les locales supportées
export type SupportedLocale = "fr" | "en" | "es";

// Fonction utilitaire pour traduire un sport en fonction de la locale
export const translateSport = (
  sportName: string,
  locale: SupportedLocale = "fr"
): string => {
  if (locale === "fr") return sportName;

  const sport = SPORTS.find((s) => s.name === sportName);
  if (!sport) return sportName;

  return sport.translations[locale] || sportName;
};

// Fonction utilitaire pour traduire un niveau en fonction de la locale
export const translateLevel = (
  levelName: string,
  locale: SupportedLocale = "fr"
): string => {
  if (locale === "fr") return levelName;

  const level = LEVEL_CLASSES.find((l) => l.name === levelName);
  if (!level) return levelName;

  return level.translations[locale] || levelName;
};

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
