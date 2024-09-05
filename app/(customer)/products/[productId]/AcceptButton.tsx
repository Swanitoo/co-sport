"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { acceptMembershipAction } from "./edit/product.action";

export type AcceptRequestButtonProps = {
  membershipId: string;
};

export const AcceptRequestButton = ({ membershipId }: AcceptRequestButtonProps) => {
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();

  const handleAcceptMembership = async () => {
    const result = await acceptMembershipAction(membershipId);

    if (result.success) {
      toast.success("Demande acceptée.");
      setShowPopup(false);
      router.refresh();
    } else {
      toast.error("Erreur : " + result.error);
    }
  };

  return (
    <>
      <Button onClick={() => setShowPopup(true)} size="sm">
        Accepter la demande
      </Button>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="p-6 rounded shadow-md">
            <p>Voulez-vous vraiment accepter cette demande ?</p>
            <div className="mt-4 flex justify-end space-x-2">
              <Button onClick={() => setShowPopup(false)} variant="secondary">
                Non
              </Button>
              <Button onClick={handleAcceptMembership} variant="default">
                Oui
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
