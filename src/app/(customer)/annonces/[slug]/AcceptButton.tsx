"use client";

import { Button } from "@/components/ui/button";
import { UsersRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ProfileAvatar } from "../../profile/[userId]/ProfileAvatar";
import {
  acceptMembershipAction,
  refuseMembershipAction,
} from "./edit/product.action";

export type AcceptRequestButtonProps = {
  membership: {
    id: string;
    productId: string;
    userId: string;
    user: {
      id: string;
      name: string | null;
      socialLink?: string | null;
      image: string | null;
    };
    comment?: string | null;
  };
  count: number;
};

export const AcceptRequestButton = ({
  membership,
  count,
}: AcceptRequestButtonProps) => {
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();

  const handleAcceptMembership = async () => {
    try {
      const result = await acceptMembershipAction({
        productId: membership.productId,
        userId: membership.userId,
      });

      if (result.serverError) {
        toast.error(result.serverError);
        return;
      }

      toast.success("Demande acceptée");
      setShowPopup(false);
      router.refresh();
    } catch (error) {
      toast.error(
        "Une erreur est survenue lors de l'acceptation de la demande"
      );
      console.error(error);
    }
  };

  const handleRefuseMembership = async () => {
    try {
      const result = await refuseMembershipAction({
        productId: membership.productId,
        userId: membership.userId,
      });

      if (result.serverError) {
        toast.error(result.serverError);
        return;
      }

      toast.success("Demande refusée");
      setShowPopup(false);
      router.refresh();
    } catch (error) {
      toast.error("Une erreur est survenue lors du refus de la demande");
      console.error(error);
    }
  };

  return (
    <>
      <div className="relative">
        <Button onClick={() => setShowPopup(true)} size="sm">
          <UsersRound />
          {count > 0 && (
            <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {count}
            </span>
          )}
        </Button>
      </div>

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded bg-secondary p-4 shadow-md sm:p-6">
            <h2 className="text-lg font-semibold">
              Accepter la demande d'adhésion
            </h2>

            <Link
              href={`/profile/${membership.user.id}`}
              className="group mt-4 flex items-center gap-4 rounded-lg p-2 hover:bg-accent"
            >
              <ProfileAvatar
                image={membership.user.image}
                name={membership.user.name}
                className="size-12 sm:size-16"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium group-hover:underline">
                  {membership.user.name}
                </p>
                <p className="text-sm text-muted-foreground">Voir le profil</p>
              </div>
            </Link>

            {membership.comment && (
              <div className="mt-4 rounded-lg bg-muted p-3">
                <p className="text-sm">
                  <strong>Message :</strong> {membership.comment}
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:space-x-2">
              <Button
                onClick={() => setShowPopup(false)}
                variant="secondary"
                className="w-full sm:w-auto"
              >
                Annuler
              </Button>
              <Button
                onClick={handleRefuseMembership}
                variant="destructive"
                className="w-full sm:w-auto"
              >
                Refuser
              </Button>
              <Button
                onClick={handleAcceptMembership}
                variant="default"
                className="w-full sm:w-auto"
              >
                Accepter
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
