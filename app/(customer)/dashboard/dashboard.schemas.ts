import { z } from "zod";

export const socialLinkRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/;

export const LocationSchema = z.object({
  name: z.string(),
  lat: z.number(),
  lng: z.number(),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(2, "Le nom doit faire au moins 2 caractères").max(50, "Le nom ne peut pas dépasser 50 caractères").nullable(),
  bio: z.string().max(300, "La bio ne peut pas dépasser 300 caractères").nullable(),
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
    .nullable(),
  city: z.string().min(2, "Le nom de la ville doit faire au moins 2 caractères").max(50, "Le nom de la ville ne peut pas dépasser 50 caractères").nullable(),
  cityLat: z.number().optional(),
  cityLng: z.number().optional(),
  country: z.string().min(2, "Le code pays doit faire au moins 2 caractères").max(2, "Le code pays doit faire 2 caractères").nullable(),
  birthDate: z.string().transform((str) => str ? new Date(str) : null).nullable(),
});

export type UpdateProfileType = z.infer<typeof UpdateProfileSchema>;