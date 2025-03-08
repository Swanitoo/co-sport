"use client";

import { Button } from "@/components/ui/button"; // Assure-toi d'importer tes composants UI
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea"; // Ajoute ton composant textarea si nécessaire
import { useMutation } from "@tanstack/react-query";
import { Loader2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { joinProductAction } from "./edit/product.action";

export type JoinButtonProps = {
  productId: string;
  userId: string;
};

export const JoinButton = ({ productId, userId }: JoinButtonProps) => {
  const router = useRouter();
  const [comment, setComment] = useState("");

  const joinMutation = useMutation({
    mutationFn: () => joinProductAction({ productId, userId, comment }),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.error || "Une erreur est survenue");
        return;
      }

      toast.success("Demande d'adhésion envoyée. En attente de validation.");
      router.refresh();
    },
  });

  const handleSubmit = () => {
    if (joinMutation.isPending) return;
    joinMutation.mutate();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="default">
          {joinMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <Users size={16} className="mr-2" />
              Rejoindre
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Envoyer une demande</DialogTitle>
          <DialogDescription>
            Ajoutez un message pour accompagner votre demande.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Votre message..."
          className="mt-2"
        />
        <DialogFooter>
          <Button onClick={handleSubmit}>
            {joinMutation.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Envoyer la demande"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
