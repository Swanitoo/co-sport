"use server";

import { prisma } from "@/prisma";

export async function markNotificationAsRead(notificationId: string) {
  await prisma.membership.update({
    where: { id: notificationId },
    data: { read: true }
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  await prisma.membership.updateMany({
    where: {
      OR: [
        {
          userId,
          status: "APPROVED",
          read: false
        },
        {
          product: { userId },
          status: "PENDING",
          read: false
        }
      ]
    },
    data: { read: true }
  });
} 