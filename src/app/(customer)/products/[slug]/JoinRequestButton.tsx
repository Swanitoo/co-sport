"use client";

import { useAppTranslations } from "@/components/i18n-provider";
import { SupportModal } from "@/components/support/SupportModal";
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
import { Loader2, UserPlus } from "lucide-react";
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
  const { t, locale } = useAppTranslations();
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [hasValidatedForm, setHasValidatedForm] = useState(false);

  const handleJoinRequest = async () => {
    setIsLoading(true);

    try {
      const result = await createMembershipAction({
        productId: props.productId,
        comment: comment || undefined,
      });

      if (result.serverError) {
        toast.error(result.serverError);
        return;
      }

      toast.success(
        t("Products.JoinRequestSuccess", "Demande envoyée avec succès")
      );
      setIsModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Erreur lors de la demande d'adhésion", error);
      toast.error(
        t("Products.JoinRequestError", "Erreur lors de l'envoi de la demande")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = () => {
    setHasValidatedForm(true);
    setIsSupportModalOpen(true);
  };

  const handleSupportContinue = () => {
    setIsSupportModalOpen(false);
    // Procéder avec l'envoi de la demande
    handleJoinRequest();
  };

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button variant="default" size="sm">
            <UserPlus className="mr-2 size-4" />
            {t("Products.Actions.Join", "Rejoindre")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("Products.JoinRequest.Title", "Demande d'adhésion")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "Products.JoinRequest.Description",
                "Envoyez une demande. Vous pouvez ajouter un message pour vous présenter."
              )}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder={t(
              "Products.JoinRequest.MessagePlaceholder",
              "Message (optionnel)"
            )}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isLoading}
            >
              {t("Common.Cancel", "Annuler")}
            </Button>
            <Button onClick={handleFormSubmit} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {t("Products.JoinRequest.Submit", "Envoyer la demande")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de soutien */}
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        onContinue={handleSupportContinue}
      />
    </>
  );
};
