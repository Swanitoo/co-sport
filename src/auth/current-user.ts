import { prisma } from "@/prisma";
import { auth } from "./auth";

export async function currentUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      bio: true,
      city: true,
      birthDate: true,
      email: true,
      image: true,
      sex: true,
      country: true,
      socialLink: true,
      isAdmin: true,
      stravaId: true,
      stravaConnected: true,
      stravaLinkRefused: true,
      stravaToken: true,
      stravaRefreshToken: true,
      stravaTokenExpiresAt: true,
      stravaPremium: true,
      stravaWeight: true,
      stravaFTP: true,
      stravaCreatedAt: true,
      stravaFollowerCount: true,
      stravaFollowingCount: true,
    },
  });

  return user;
}

export const requiredCurrentUser = async () => {
  const user = await currentUser();

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};
