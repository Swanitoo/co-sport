"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Star, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  markMessageAsRead,
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
  }[];
  approvedRequests: {
    id: string;
    productId: string;
    productName: string;
    userName: string;
    createdAt: Date;
  }[];
  unreadMessages: {
    id: string;
    productId: string;
    productName: string;
    userName: string;
    createdAt: Date;
    messageText: string;
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

  const handleNotificationClick = async (id: string, productId: string) => {
    await markNotificationAsRead(id);
    router.push(`/products/${productId}`);
    router.refresh();
  };

  const handleMessageClick = async (id: string, productId: string) => {
    await markMessageAsRead(id);
    router.push(`/products/${productId}`);
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
      <Card className="p-4">
        <p className="text-sm text-muted-foreground">Aucune notification</p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <CardHeader className="flex justify-between">
        <div className="flex items-center gap-2">
          <CardTitle>Notifications</CardTitle>
          {totalNotifications > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
              {totalNotifications}
            </span>
          )}
        </div>
      </CardHeader>
      <div className="space-y-4">
        {pendingRequests.map((request) => (
          <Link
            key={request.id}
            href={`/products/${request.productId}`}
            onClick={() =>
              handleNotificationClick(request.id, request.productId)
            }
          >
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-left"
            >
              <UserPlus className="size-4 shrink-0" />
              <div className="flex-1 truncate">
                <span className="font-medium">{request.userName}</span> souhaite
                rejoindre votre annonce{" "}
                <span className="font-medium">{request.productName}</span>
              </div>
            </Button>
          </Link>
        ))}

        {approvedRequests.map((request) => (
          <Link
            key={request.id}
            href={`/products/${request.productId}`}
            onClick={() =>
              handleNotificationClick(request.id, request.productId)
            }
          >
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-left"
            >
              <UserPlus className="size-4 shrink-0" />
              <div className="flex-1 truncate">
                Votre demande pour rejoindre{" "}
                <span className="font-medium">{request.productName}</span> a été
                acceptée
              </div>
            </Button>
          </Link>
        ))}

        {unreadMessages.map((message) => (
          <Link
            key={message.id}
            href={`/products/${message.productId}`}
            onClick={() => handleMessageClick(message.id, message.productId)}
          >
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-left"
            >
              <MessageSquare className="size-4 shrink-0" />
              <div className="flex-1 truncate">
                <span className="font-medium">{message.userName}</span> a envoyé
                un message dans{" "}
                <span className="font-medium">{message.productName}</span>
              </div>
            </Button>
          </Link>
        ))}

        {unreadReviews.map((review) => (
          <div key={review.id} className="flex">
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
              <div className="flex-1">
                <div className="truncate">
                  <Link
                    href={`/users/${review.userName}`}
                    className="font-medium hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      router.push(`/users/${review.userName}`);
                    }}
                  >
                    {review.userName}
                  </Link>{" "}
                  a laissé un avis sur{" "}
                  <span className="font-medium">{review.productName}</span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <div className="flex">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="size-3 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <span className="truncate">{review.text}</span>
                </div>
              </div>
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
