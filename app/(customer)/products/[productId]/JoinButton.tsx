"use client";

import { Button } from "@/components/ui/button";
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
  const joinMutation = useMutation({
    mutationFn: () => joinProductAction({ productId, userId }),
    onSuccess: ({ data, serverError }) => {
      if (serverError) {
        toast.error(serverError);
        return;
      }

      toast.success("Demande d'adhésion envoyée. En attente de validation.");

      router.refresh();
    },
  });

  const [isPending, setIsPending] = useState(false);

  return (
    <Button
      size="sm"
      variant="default"
      onClick={() => {
        if (isPending) return;
        setIsPending(true);
        joinMutation.mutate();
      }}
    >
      {joinMutation.isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <>
          <Users size={16} className="mr-2" />
          Rejoindre
        </>
      )}
    </Button>
  );
};
