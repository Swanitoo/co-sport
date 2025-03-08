"use client";

import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { removeMemberAction } from "./edit/product.action";

export type RemoveMemberButtonProps = {
  membershipId: string;
};

export const RemoveMemberButton = ({
  membershipId,
}: RemoveMemberButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [comment, setComment] = useState("");

  const removeMemberMutation = useMutation({
    mutationFn: () => removeMemberAction({ membershipId, comment }),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.error);
        return;
      }

      toast.success("Le membre a été retiré du groupe.");
      setIsOpen(false);
    },
  });

  return (
    <>
      <Button size="sm" variant="destructive" onClick={() => setIsOpen(true)}>
        Retirer du groupe
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded bg-secondary p-6 shadow-md">
            <h2 className="text-lg font-semibold">
              Retirer le membre du groupe
            </h2>
            <p className="mt-4 text-sm">
              Es-tu sûr de vouloir retirer ce membre ?
            </p>
            <textarea
              className="mt-4 w-full rounded border p-2"
              placeholder="Ajoute un commentaire (optionnel)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <div className="mt-6 flex justify-end space-x-2">
              <Button onClick={() => setIsOpen(false)} variant="secondary">
                Annuler
              </Button>
              <Button
                onClick={() => {
                  setIsLoading(true);
                  removeMemberMutation.mutate();
                }}
                variant="default"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin" /> : "Confirmer"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
