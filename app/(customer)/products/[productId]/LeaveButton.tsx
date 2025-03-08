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
  const [showConfirm, setShowConfirm] = useState(false);

  const leaveMutation = useMutation({
    mutationFn: () => leaveGroupAction(props.productId, props.userId),
    onSuccess: () => {
      toast.success("Tu as quitté le groupe.");
      router.refresh();
    },
    onError: (error) => {
      toast.error(
        "Erreur lors de la tentative de quitter le groupe: " + error.message,
      );
    },
  });

  return (
    <>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => setShowConfirm(true)}
      >
        Quitter le groupe
      </Button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg bg-secondary p-4 shadow-lg">
            <p>Es-tu sûr sûr de vouloir quitter ce groupe ?</p>
            <div className="mt-4 flex justify-end space-x-2">
              <Button variant="secondary" onClick={() => setShowConfirm(false)}>
                Non
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  leaveMutation.mutate();
                  setShowConfirm(false);
                }}
              >
                Oui
              </Button>
            </div>
          </div>
          {leaveMutation.isPending && (
            <Loader2 className="size-4 animate-spin" />
          )}
        </div>
      )}
    </>
  );
};
