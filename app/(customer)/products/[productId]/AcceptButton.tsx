"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { acceptMembershipAction, refuseMembershipAction } from "./edit/product.action";
import { UsersRound } from "lucide-react";

export type AcceptRequestButtonProps = {
  membership: {
    id: string;
    user: {
      name: string | null;
      socialLink?: string | null;
      image?: string | null;
    };
    comment?: string | null;
  };
  count: number;
};

export const AcceptRequestButton = ({ membership, count }: AcceptRequestButtonProps) => {
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();

  const handleAcceptMembership = async () => {
    const result = await acceptMembershipAction(membership.id);

    if (result.success) {
      toast.success("Demande acceptée.");
      setShowPopup(false);
      router.refresh();
    } else {
      toast.error("Erreur : " + result.error);
    }
  };

  const handleRefuseMembership = async () => {
    const result = await refuseMembershipAction(membership.id);
    if (result.success) {
      toast.success("Demande refusée.");
      setShowPopup(false);
      router.refresh();
    } else {
      toast.error("Erreur : " + result.error);
    }
  };

  return (
    <>
      <div className="relative">
        <Button onClick={() => setShowPopup(true)} size="sm">
          <UsersRound />
          {count > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs">
              {count}
            </span>
          )}
        </Button>
      </div>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-secondary p-6 rounded shadow-md w-full max-w-md">
            <h2 className="text-lg font-semibold">Accepter la demande d'adhésion</h2>

            <p className="mt-4 text-sm">
              <strong>Nom :</strong> {membership.user.name}
            </p>

            {membership.comment && (
              <p className="mt-2 text-sm text-gray">
                <strong>Message :</strong> {membership.comment}
              </p>
            )}

            <div className="mt-6 flex justify-end space-x-2">
              <Button onClick={() => setShowPopup(false)} variant="secondary">Annuler</Button>
              <Button onClick={handleRefuseMembership} variant="destructive">Refuser</Button>
              <Button onClick={handleAcceptMembership} variant="default">Accepter</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
