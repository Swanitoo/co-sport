"use server";

import { currentUser } from "@/auth/current-user";
import { prisma } from "@/prisma";

export type ContactMessageData = {
  subject: string;
  message: string;
};

export type FeedbackData = {
  rating: number;
  feedback: string;
};

export async function sendContactMessage(data: ContactMessageData) {
  const user = await currentUser();
  if (!user) {
    throw new Error("Vous devez être connecté pour envoyer un message");
  }

  await prisma.contactMessage.create({
    data: {
      subject: data.subject,
      message: data.message,
      userId: user.id,
    },
  });
}

export async function sendFeedback(data: FeedbackData) {
  const user = await currentUser();
  if (!user) {
    throw new Error("Vous devez être connecté pour envoyer un feedback");
  }

  await prisma.feedback.create({
    data: {
      rating: data.rating,
      feedback: data.feedback,
      userId: user.id,
    },
  });
}
