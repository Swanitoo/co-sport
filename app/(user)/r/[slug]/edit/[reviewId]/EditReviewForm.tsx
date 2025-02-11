"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Review, User } from "@prisma/client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import ReviewSelector from "../../RatingSelector";
import { adminUpdateReviewAction } from "../../reviews.action";

interface EditReviewFormProps {
  review: Review & {
    user: User | null;
  };
  slug: string;
}

export function EditReviewForm({ review, slug }: EditReviewFormProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [rating, setRating] = useState(review.rating);
  const [text, setText] = useState(review.text || "");

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await adminUpdateReviewAction({
        reviewId: review.id,
        rating,
        text,
      });
      toast.success("Avis mis à jour avec succès");
      router.push(`/wall/${slug}`);
      router.refresh();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour de l'avis");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Modifier l'avis</h1>
        <p className="text-muted-foreground">
          Auteur: {review.user?.name || "Anonyme"}
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Note</label>
          <ReviewSelector initialRating={rating} onSelect={setRating} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Commentaire</label>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Commentaire de l'avis"
            className="w-full"
          />
        </div>

        <div className="flex gap-4">
          <Button onClick={handleUpdate} disabled={isUpdating}>
            {isUpdating ? "Mise à jour..." : "Mettre à jour"}
          </Button>
          <Button variant="ghost" asChild>
            <Link href={`/wall/${slug}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 