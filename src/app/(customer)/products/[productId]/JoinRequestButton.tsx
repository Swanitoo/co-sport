"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createMembershipAction } from "./edit/product.action";

type MembershipStatus = "PENDING" | "APPROVED" | "REFUSED";

export type JoinRequestButtonProps = {
  productId: string;
  userId: string;
  status?: MembershipStatus;
};

export const JoinRequestButton = (props: JoinRequestButtonProps) => {
  const router = useRouter();
  const [comment, setComment] = useState("");

  const joinMutation = useMutation({
    mutationFn: () =>
      createMembershipAction({
        productId: props.productId,
        comment: comment || undefined,
      }),
    onSuccess: ({ success, serverError }) => {
      if (serverError) {
        toast.error(serverError);
        return;
      }

      toast.success("Demande envoyée avec succès");
      router.refresh();
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Rejoindre</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Demande d'adhésion</DialogTitle>
          <DialogDescription>
            Envoyez une demande. Vous pouvez ajouter un message pour vous
            présenter.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="Message (optionnel)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <DialogFooter>
          <Button
            onClick={() => joinMutation.mutate()}
            disabled={joinMutation.isPending}
          >
            {joinMutation.isPending && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            Envoyer la demande
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
