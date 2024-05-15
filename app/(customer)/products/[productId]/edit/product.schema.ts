import { z } from "zod";

export const ProductSchema = z.object({
    name: z.string(),
    slug: z
        .string()
        .regex(/^[a-zA-Z0-9_-]*^/)
        .min(5)
        .max(20),
    image: z.string().optional().nullable(),
    noteText: z.string().optional().nullable(),
    informationText: z.string().optional().nullable(),
    reviewText: z.string().optional().nullable(),
    thanksText: z.string().optional().nullable(),
    backgroundColor: z.string().optional().nullable(),
});

export type ProductType = z.infer<typeof ProductSchema>;

export const GRADIENTS_CLASSES = [
    "bg-gradient-to-r from-pink-500 to-rose-500",
    "bg-gradient-to-r from-fuchsia-500 to-cyan-500",
    "bg-gradient-to-r from-fuchsia-600 to-pink-600",
    "bg-gradient-to-r from-blue-800 to-indigo-900",
];