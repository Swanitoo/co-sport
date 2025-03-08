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

  const removeMemberMutation = useMutation({
    mutationFn: () => removeMemberAction(membershipId),
    onSuccess: (response) => {
      if (response.serverError) {
        toast.error(response.serverError);
        return;
      }
      toast.success("Le membre a été retiré du groupe.");
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error("Une erreur est survenue lors du retrait du membre");
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

            <div className="mt-6 flex justify-end space-x-2">
              <Button onClick={() => setIsOpen(false)} variant="secondary">
                Annuler
              </Button>
              <Button
                onClick={() => removeMemberMutation.mutate()}
                variant="default"
                disabled={removeMemberMutation.isPending}
              >
                {removeMemberMutation.isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Confirmer"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
