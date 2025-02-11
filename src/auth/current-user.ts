import { prisma } from "@/prisma";
import { baseAuth } from "./auth";

export const currentUser = async () => {
  const session = await baseAuth();

  if (!session?.user) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      createdAt: true,
      plan: true,
      updatedAt: true,
      stripeCustomerId: true,
      socialLink: true,
      bio: true,
      city: true,
      country: true,
      sex: true,
      state: true,
      birthDate: true,
      nationality: true,
      isAdmin: true,
      profileCompleted: true,
    },
  });

  return user;
};

export const requiredCurrentUser = async () => {
  const user = await currentUser();

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};