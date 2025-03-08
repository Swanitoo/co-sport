"use server";

import { prisma } from "@/prisma";

export async function markNotificationAsRead(notificationId: string) {
  await prisma.membership.update({
    where: { id: notificationId },
    data: { read: true },
  });
}

export async function markMessageAsRead(unreadMessageId: string) {
  await prisma.unreadMessage.delete({
    where: { id: unreadMessageId },
  });
}

export async function markMessagesAsRead(messageIds: string[]) {
  if (!messageIds || messageIds.length === 0) return;

  await prisma.unreadMessage.deleteMany({
    where: {
      id: {
        in: messageIds,
      },
    },
  });
}

export async function markReviewAsRead(reviewId: string) {
  await prisma.review.update({
    where: { id: reviewId },
    data: { read: true },
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  await prisma.membership.updateMany({
    where: {
      OR: [
        {
          userId,
          status: "APPROVED",
          read: false,
        },
        {
          product: { userId },
          status: "PENDING",
          read: false,
        },
      ],
    },
    data: { read: true },
  });
}
