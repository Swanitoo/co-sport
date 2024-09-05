"use client";

import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { leaveGroupAction } from "./edit/product.action";

export type LeaveButtonProps = {
  productId: string;
  userId: string;
};

export const LeaveButton = (props: LeaveButtonProps) => {
  const router = useRouter();
  const leaveMutation = useMutation({
    mutationFn: () => leaveGroupAction(props.productId, props.userId),
    onSuccess: ({ data, serverError }) => {
      if (serverError) {
        toast.error(serverError);
        return;
      }

      toast.success("Vous avez quitté le groupe.");

      router.push("/dashboard");
      router.refresh();
    },
  });

  const [isConfirming, setIsConfirming] = useState(false);

  return (
    <Button
      size="sm"
      variant="destructive"
      onClick={() => {
        if (isConfirming) {
          leaveMutation.mutate();
        } else {
          setIsConfirming(true);
        }
      }}
    >
      {leaveMutation.isPending && <Loader2 className="size-4 animate-spin" />}
      {isConfirming ? "Êtes-vous sûr ?" : "Quitter le groupe"}
    </Button>
  );
};
