// app/dashboard/actions.ts
"use server";

import { requiredCurrentUser } from "@/auth/current-user";
import { prisma } from "@/prisma";
import { revalidatePath } from "next/cache";
import { UpdateProfileSchema } from "./dashboard.schemas";

export async function updateName(formData: FormData) {
  const name = formData.get("name") as string;
  const user = await requiredCurrentUser();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: UpdateProfileSchema.shape.name.parse(name),
    },
  });

  revalidatePath("/dashboard");
}

export async function updateBio(formData: FormData) {
  const bio = formData.get("bio") as string;
  const user = await requiredCurrentUser();
  await prisma.user.update({
    where: { id: user.id },
    data: { bio: UpdateProfileSchema.shape.bio.parse(bio) },
  });
  revalidatePath("/dashboard");
}

export async function updateSocialLink(formData: FormData) {
  const socialLink = formData.get("socialLink") as string;
  const user = await requiredCurrentUser();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      socialLink: socialLink
        ? UpdateProfileSchema.shape.socialLink.parse(socialLink)
        : null,
    },
  });

  revalidatePath("/dashboard");
}
export async function updateLocation(formData: FormData) {
  const city = formData.get("city") as string;
  const user = await requiredCurrentUser();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      city: UpdateProfileSchema.shape.city.parse(city),
    },
  });

  revalidatePath("/dashboard");
}

export async function updateCountry(formData: FormData) {
  const country = formData.get("country") as string;
  const user = await requiredCurrentUser();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      country: UpdateProfileSchema.shape.country.parse(country),
    },
  });

  revalidatePath("/dashboard");
}

export async function updateBirthDate(formData: FormData) {
  const user = await requiredCurrentUser();
  const birthDate = formData.get("birthDate") as string;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      birthDate: UpdateProfileSchema.shape.birthDate.parse(birthDate),
    },
  });

  revalidatePath("/dashboard");
}
