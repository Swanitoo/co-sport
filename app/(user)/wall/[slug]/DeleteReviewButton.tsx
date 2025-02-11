"use client";

import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteReviewAction } from "../../r/[slug]/reviews.action";

interface DeleteReviewButtonProps {
  reviewId: string;
}

export function DeleteReviewButton({ reviewId }: DeleteReviewButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet avis ?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteReviewAction({ reviewId });
      toast.success("Avis supprimé avec succès");
      router.refresh();
    } catch (error) {
      toast.error("Erreur lors de la suppression de l'avis");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-destructive"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <Trash className="h-4 w-4" />
    </Button>
  );
} 