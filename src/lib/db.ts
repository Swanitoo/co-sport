import { prisma } from "@/prisma";

// Exporter prisma comme module par défaut et comme export nommé
export { prisma };
export const db = prisma;
export default prisma;
