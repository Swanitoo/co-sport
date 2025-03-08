import { currentUser } from "@/auth/current-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LoggedInDropdown } from "@/features/auth/LoggedInDropdown";
import { LoginDialog } from "@/features/auth/LoginDialog";
import { ModeToggle } from "@/features/theme/ModeToggle";
import { prisma } from "@/prisma";
import Image from "next/image";
import Link from "next/link";

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
    <header className="w-full border-b border-border py-1">
      <div className="mx-auto flex w-full max-w-5xl flex-row items-center gap-4 px-4 py-0">
        <div className="flex-1">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Image src="/icon.png" alt="Logo" width={32} height={32} />
          </Link>
        </div>

        <div className="flex items-center justify-end space-x-2">
          <ModeToggle />
          {user ? (
            <LoggedInDropdown
              userId={user.id}
              user={{
                name: user.name,
                email: user.email,
                image: user.image,
              }}
              pendingRequestsCount={pendingRequestsCount}
              unreadMessagesCount={unreadMessagesCount}
              approvedRequestsCount={approvedRequestsCount}
              unreadReviewsCount={unreadReviewsCount}
            >
              <Button variant="ghost" className="relative size-8 rounded-full">
                <Avatar className="size-8">
                  <AvatarImage
                    src={user.image || undefined}
                    alt={user.name || ""}
                  />
                  <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                </Avatar>
              </Button>
            </LoggedInDropdown>
          ) : (
            <LoginDialog
              trigger={
                <span className="inline-block cursor-pointer">
                  <Button>Connexion</Button>
                </span>
              }
            />
          )}
        </div>
      </div>
    </header>
  );
}
