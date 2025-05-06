"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Star, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  markMessageAsRead,
  markMessagesAsRead,
  markNotificationAsRead,
  markReviewAsRead,
} from "./notifications.action";

interface NotificationsCardProps {
  pendingRequests: {
    id: string;
    productId: string;
    productName: string;
    userName: string;
    createdAt: Date;
    productSlug?: string;
  }[];
  approvedRequests: {
    id: string;
    productId: string;
    productName: string;
    userName: string;
    createdAt: Date;
    productSlug?: string;
  }[];
  unreadMessages: {
    id: string;
    messageIds: string[];
    productId: string;
    productName: string;
    userName: string;
    messageCount: number;
    createdAt: Date;
    messageText: string;
    productSlug?: string;
  }[];
  unreadReviews: {
    id: string;
    productId: string;
    productName: string;
    userName: string;
    createdAt: Date;
    rating: number;
    text: string;
    level: string;
    productSlug?: string;
  }[];
}

export function NotificationsCard({
  pendingRequests,
  approvedRequests,
  unreadMessages,
  unreadReviews,
}: NotificationsCardProps) {
  const router = useRouter();
  const totalNotifications =
    pendingRequests.length +
    approvedRequests.length +
    unreadMessages.length +
    unreadReviews.length;

  const handleNotificationClick = async (
    id: string,
    productId: string,
    productSlug?: string
  ) => {
    await markNotificationAsRead(id);
    router.push(`/annonces/${productSlug || productId}`);
    router.refresh();
  };

  const handleMessageClick = async (
    messageIds: string[],
    productId: string,
    productSlug?: string
  ) => {
    if (messageIds.length > 1) {
      await markMessagesAsRead(messageIds);
    } else if (messageIds.length === 1) {
      await markMessageAsRead(messageIds[0]);
    }
    router.push(`/annonces/${productSlug || productId}`);
    router.refresh();
  };

  const handleReviewClick = async (
    id: string,
    productId: string,
    productName: string,
    level: string
  ) => {
    await markReviewAsRead(id);
    const urlProductName = productName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const normalizedLevel = level
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    router.push(`/wall/${urlProductName}-${normalizedLevel}`);
    router.refresh();
  };

  if (totalNotifications === 0) {
    return (
      <Card className="h-fit p-4">
        <CardHeader className="flex justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Notifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Aucune notification</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-fit">
      <CardHeader className="flex justify-between">
        <div className="flex items-center gap-2">
          <CardTitle>Notifications</CardTitle>
          <span className="flex size-6 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {totalNotifications}
          </span>
        </div>
      </CardHeader>
      <CardContent className="max-h-[60vh] space-y-4 overflow-y-auto">
        {pendingRequests.map((request) => (
          <Link
            key={request.id}
            href={`/annonces/${request.productSlug || request.productId}`}
            onClick={() =>
              handleNotificationClick(
                request.id,
                request.productId,
                request.productSlug
              )
            }
            className="block"
          >
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-left"
            >
              <UserPlus className="size-4 shrink-0" />
              <div
                className="min-w-0 flex-1"
                style={{ maxWidth: "calc(100% - 28px)" }}
              >
                <div className="max-w-full truncate">
                  {(() => {
                    // Formatage avec limite stricte
                    const userName = request.userName || "";
                    const productName = request.productName || "";

                    // Version ultra-courte
                    const shortUserName =
                      userName.length > 7
                        ? userName.substring(0, 7) + "..."
                        : userName;
                    const shortProductName =
                      productName.length > 7
                        ? productName.substring(0, 7) + "..."
                        : productName;

                    return (
                      <>
                        <span className="font-medium">{shortUserName}</span>
                        <span className="sm:inline">souhaite rejoindre </span>
                        <span className="hidden sm:inline">votre annonce </span>
                        <span className="font-medium">{shortProductName}</span>
                      </>
                    );
                  })()}
                </div>
              </div>
            </Button>
          </Link>
        ))}

        {approvedRequests.map((request) => (
          <Link
            key={request.id}
            href={`/annonces/${request.productSlug || request.productId}`}
            onClick={() =>
              handleNotificationClick(
                request.id,
                request.productId,
                request.productSlug
              )
            }
            className="block"
          >
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-left"
            >
              <UserPlus className="size-4 shrink-0" />
              <div
                className="min-w-0 flex-1"
                style={{ maxWidth: "calc(100% - 28px)" }}
              >
                <div className="max-w-full truncate">
                  {(() => {
                    const productName = request.productName || "";
                    const shortProductName =
                      productName.length > 7
                        ? productName.substring(0, 7) + "..."
                        : productName;

                    return (
                      <>
                        <span className="hidden sm:inline">
                          Votre demande pour rejoindre{" "}
                        </span>
                        <span className="sm:hidden">Rejoint </span>
                        <span className="font-medium">{shortProductName}</span>
                        <span className="hidden sm:inline">
                          {" "}
                          a été acceptée
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>
            </Button>
          </Link>
        ))}

        {unreadMessages.map((message) => (
          <Link
            key={message.id}
            href={`/annonces/${message.productSlug || message.productId}`}
            onClick={() =>
              handleMessageClick(
                message.messageIds,
                message.productId,
                message.productSlug
              )
            }
            className="block w-full"
          >
            <Button
              variant="ghost"
              className="relative w-full justify-start gap-2 text-left"
            >
              <MessageSquare className="size-4 shrink-0" />
              <div
                className="min-w-0 flex-1"
                style={{ maxWidth: "calc(100% - 28px)" }}
              >
                {/* Version mobile - très simplifiée avec br */}
                <div className="block sm:hidden">
                  <div className="truncate font-medium">
                    {message.userName &&
                      (message.userName.length > 10
                        ? message.userName.substring(0, 10) + "..."
                        : message.userName)}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    vous a envoyé un message
                  </div>
                </div>

                {/* Version desktop plus complète */}
                <div className="hidden sm:block">
                  <div className="max-w-full truncate">
                    <span className="font-medium">
                      {message.userName || ""}
                    </span>
                    {message.messageCount > 1
                      ? ` a envoyé ${message.messageCount} messages dans `
                      : ` a envoyé un message dans `}
                    <span className="font-medium">
                      {message.productName || ""}
                    </span>
                  </div>
                  {message.messageText && (
                    <p className="truncate text-sm text-muted-foreground">
                      {message.messageText}
                    </p>
                  )}
                </div>
              </div>
            </Button>
          </Link>
        ))}

        {unreadReviews.map((review) => (
          <div key={review.id} className="block">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-left"
              onClick={() =>
                handleReviewClick(
                  review.id,
                  review.productId,
                  review.productName,
                  review.level
                )
              }
            >
              <Star className="size-4 shrink-0" />
              <div
                className="min-w-0 flex-1"
                style={{ maxWidth: "calc(100% - 28px)" }}
              >
                <div className="max-w-full truncate">
                  {(() => {
                    const userName = review.userName || "";
                    const productName = review.productName || "";

                    const shortUserName =
                      userName.length > 7
                        ? userName.substring(0, 7) + "..."
                        : userName;
                    const shortProductName =
                      productName.length > 7
                        ? productName.substring(0, 7) + "..."
                        : productName;

                    return (
                      <>
                        <span className="font-medium">{shortUserName}</span>
                        <span className="hidden sm:inline">
                          {" "}
                          a laissé un avis sur{" "}
                        </span>
                        <span className="sm:hidden"> avis </span>
                        <span className="font-medium">{shortProductName}</span>
                      </>
                    );
                  })()}
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <div className="flex shrink-0">
                    {Array.from({ length: Math.min(review.rating, 3) }).map(
                      (_, i) => (
                        <Star
                          key={i}
                          className="size-3 fill-yellow-400 text-yellow-400"
                        />
                      )
                    )}
                    {review.rating > 3 && (
                      <span className="text-xs">+{review.rating - 3}</span>
                    )}
                  </div>
                  <span
                    className="truncate"
                    style={{ maxWidth: "calc(100% - 60px)" }}
                  >
                    {review.text && review.text.length > 15
                      ? `${review.text.substring(0, 15)}...`
                      : review.text}
                  </span>
                </div>
              </div>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
