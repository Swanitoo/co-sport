"use client";

import { Button } from "@/components/ui/button";
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

  const handleLeaveGroup = async () => {
    const result = await leaveGroupAction({
      productId: props.productId,
      userId: props.userId,
    });

    if (result.serverError) {
      toast.error(result.serverError);
      return;
    }

    toast.success("Vous avez quitté le groupe");
  };

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
                  handleLeaveGroup();
                  setShowConfirm(false);
                }}
              >
                Oui
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
