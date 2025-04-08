"use server";

import { signIn, signOut } from "@/auth/auth";
import { COUNTRIES } from "@/data/country";
import { prisma } from "@/prisma";
import { ActionError, userAction } from "@/safe-actions";
import { z } from "zod";

export const singOutAction = async () => {
  await signOut();
};

export const signInAction = async () => {
  await signIn();
};

export const signInWithStravaAction = async () => {
  await signIn("strava");
};

export const deleteAccountAction = userAction(
  z.object({}),
  async (_, { user }) => {
    if (!user) {
      throw new ActionError(
        "Vous devez être connecté pour supprimer votre compte"
      );
    }

    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });

    return { success: true };
  }
);

const profileDataSchema = z.object({
  sex: z.enum(["M", "F", "O"]).optional(),
  country: z.string().optional(),
  email: z.string().email().optional(),
  stravaLinkRefused: z.boolean().optional(),
});

export const updateUserProfile = userAction(
  profileDataSchema,
  async (data, { user }) => {
    const updateData = { ...data };

    if (data.country) {
      const countryObject = COUNTRIES.find((c) => c.code === data.country);
      if (countryObject) {
        updateData.nationality = countryObject.name;
      }
    }

    return await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });
  }
);

export const updateProfileImage = userAction(
  z.object({
    imageUrl: z.string().url(),
  }),
  async ({ imageUrl }, { user }) => {
    return await prisma.user.update({
      where: { id: user.id },
      data: {
        image: imageUrl,
      },
    });
  }
);
