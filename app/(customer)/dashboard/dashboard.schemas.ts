import { z } from "zod";

export const socialLinkRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/;

export const LocationSchema = z.object({
  name: z.string(),
  lat: z.number(),
  lng: z.number(),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(2, "Le nom doit faire au moins 2 caractères").max(50, "Le nom ne peut pas dépasser 50 caractères"),
  bio: z.string().max(500, "La bio ne peut pas dépasser 500 caractères").optional(),
  socialLink: z.string()
    .regex(socialLinkRegex, "Le lien n'est pas valide")
    .refine((url) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    }, "Le lien n'est pas valide")
    .optional(),
  city: z.string().optional(),
  cityLat: z.number().optional(),
  cityLng: z.number().optional(),
  country: z.string().length(2, "Le code pays doit faire 2 caractères").optional(),
});

export type UpdateProfileType = z.infer<typeof UpdateProfileSchema>;