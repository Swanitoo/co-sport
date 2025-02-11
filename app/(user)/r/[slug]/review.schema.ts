import { z } from "zod";

export const ReviewSchema = z.object({
    id: z.string().optional(),
    rating: z.number().optional(),
    text: z.string().optional(),
    socialLink: z.string().optional(),
    name: z.string().optional(),
    productId: z.string(),
    userId: z.string().optional(),
});

export type ReviewType = z.infer<typeof ReviewSchema>;