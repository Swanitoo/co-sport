import { currentUser } from "@/auth/current-user";
import { prisma } from "@/prisma";
import { SiteHeader } from "./site-header";

export async function Header() {
  const user = await currentUser();

  let pendingRequestsCount = 0;
  let unreadMessagesCount = 0;
  let approvedRequestsCount = 0;
  let unreadReviewsCount = 0;

  if (user) {
    const [pendingRequests, unreadMessages, approvedRequests, unreadReviews] =
      await Promise.all([
        prisma.membership.count({
          where: {
            product: {
              userId: user.id,
            },
            status: "PENDING",
          },
        }),
        prisma.unreadMessage.count({
          where: {
            userId: user.id,
          },
        }),
        prisma.membership.count({
          where: {
            userId: user.id,
            status: "APPROVED",
            read: false,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 derniers jours
            },
          },
        }),
        prisma.review.count({
          where: {
            product: {
              userId: user.id,
            },
            read: false,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 derniers jours
            },
          },
        }),
      ]);
    pendingRequestsCount = pendingRequests;
    unreadMessagesCount = unreadMessages;
    approvedRequestsCount = approvedRequests;
    unreadReviewsCount = unreadReviews;
  }

  return (
    <SiteHeader
      user={user}
      pendingRequestsCount={pendingRequestsCount}
      unreadMessagesCount={unreadMessagesCount}
      approvedRequestsCount={approvedRequestsCount}
      unreadReviewsCount={unreadReviewsCount}
    />
  );
}
