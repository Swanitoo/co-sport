"use server";

import { signIn, signOut } from "@/auth/auth";
import { prisma } from "@/prisma";
import { ActionError, userAction } from "@/safe-actions";
import { z } from "zod";

export const singOutAction = async () => {
  await signOut();
};

export const signInAction = async () => {
  await signIn();
};

const profileDataSchema = z.object({
  sex: z.enum(["M", "F", "O"]).optional(),
  country: z.string().optional(),
});

export const updateUserProfile = userAction(
  profileDataSchema,
  async (data, { user }) => {
    return await prisma.user.update({
      where: { id: user.id },
      data: {
        ...data,
      },
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
