"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";
import { X } from "lucide-react";
import Link from "next/link";
import { markNotificationAsRead } from "./notifications.action";

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
}

export function NotificationsCard({ pendingRequests, approvedRequests }: NotificationsCardProps) {
  const totalNotifications = pendingRequests.length + approvedRequests.length;

  const handleClose = async (id: string) => {
    await markNotificationAsRead(id);
    // Rafraîchir la page pour mettre à jour les notifications
    window.location.reload();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Notifications</span>
          {totalNotifications > 0 && (
            <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
              {totalNotifications}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {totalNotifications === 0 ? (
          <p className="text-muted-foreground">Aucune notification</p>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="relative">
                <button
                  onClick={() => handleClose(request.id)}
                  className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
                <Link
                  href={`/products/${request.productId}`}
                  className="block p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <p className="font-medium pr-6">
                    Nouvelle demande pour {request.productName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    De {request.userName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistance(new Date(request.createdAt), new Date(), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </p>
                </Link>
              </div>
            ))}
            {approvedRequests.map((request) => (
              <div key={request.id} className="relative">
                <button
                  onClick={() => handleClose(request.id)}
                  className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
                <Link
                  href={`/products/${request.productId}`}
                  className="block p-4 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 transition-colors dark:border-green-900 dark:bg-green-900/20 dark:hover:bg-green-900/30"
                >
                  <p className="font-medium pr-6">
                    Demande acceptée pour {request.productName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {request.userName} a accepté votre demande
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistance(new Date(request.createdAt), new Date(), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 