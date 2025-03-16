"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Clock } from "lucide-react";

type ReviewsPanelProps = {
  reviews: {
    id: string;
    rating: number;
    feedback: string;
    createdAt: Date;
    user: {
      name: string | null;
      email?: string | null;
    };
  }[];
  currentUser?: {
    isAdmin?: boolean;
  };
};

export function ReviewsPanel({ reviews, currentUser }: ReviewsPanelProps) {
  const isAdmin = currentUser?.isAdmin || false;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const renderStarRating = (rating: number) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  if (reviews.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Aucun avis disponible pour le moment.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Voici les avis récents de nos utilisateurs sur co-sport.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="text-yellow-500">
                  {renderStarRating(review.rating)}
                </span>
                <span className="flex items-center text-xs text-muted-foreground">
                  <Clock className="mr-1 size-3" />
                  {formatDate(review.createdAt)}
                </span>
              </div>
              <CardDescription>
                De : {review.user.name || "Utilisateur anonyme"}
                {isAdmin && review.user.email && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({review.user.email})
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">{review.feedback}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
