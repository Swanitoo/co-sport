import { User } from "@prisma/client";
import { baseAuth } from "./auth";
import { prisma } from "@/prisma";

export const currentUser = async () => {
  const session = await baseAuth();

  if (!session?.user) {
    return null;
  }

  // Vérifie si l'ID utilisateur est présent dans la session
  const sessionUser = session.user as User | { id: string };

  // Si l'ID est disponible, récupère l'utilisateur complet depuis la base de données
  if (sessionUser.id) {
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
    });

    if (!user) {
      return null;
    }

    return user;
  }
  return sessionUser as User;
};

export const requiredCurrentUser = async () => {
  const user = await currentUser();

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};