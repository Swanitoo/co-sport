import { action } from "@/safe-actions";
import { z } from "zod";

export const updateReviewAction = action(
    z.object({
        id: z.string().optional(),
        rating: z.number().optional(),
        text: z.string().optional(),
        audio: z.string().optional(),
        socialLink: z.string().optional(),
        name: z.string().optional(),
}),
);