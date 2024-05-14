import { z } from "zod";

export const ProductSchema = z.object({
    name: z.string(),

    noteText: z.string().optional(),
    informationText: z.string().optional(),
    reviewText: z.string().optional(),
    thanksText: z.string().optional(),
    backgroundColor: z.string(),
});

export type ProductType = z.infer<typeof ProductSchema>;

export const GRADIENTS_CLASSES = [
    "bg-gradient-to-r from-pink-500 to-rose-500",
    "bg-gradient-to-r from-fuchsia-500 to-cyan-500",
    "bg-gradient-to-r from-fuchsia-600 to-pink-600",
    "bg-gradient-to-r from-blue-800 to-indigo-900",
];