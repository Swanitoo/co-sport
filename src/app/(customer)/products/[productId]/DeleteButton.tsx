"use client";

import { useAppTranslations } from "@/components/i18n-provider";
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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteProductAction } from "./edit/product.action";

export type DeleteButtonProps = {
  productId: string;
};

export const DeleteButton = (props: DeleteButtonProps) => {
  const { t, locale } = useAppTranslations();
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    const result = await deleteProductAction(props.productId);

    if (result.serverError) {
      toast.error(result.serverError);
      return;
    }

    toast.success(t("Products.DeleteSuccess", "Groupe supprimé avec succès"));
    router.push(`/${locale}/products`);
  };

  return (
    <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          {t("Products.Actions.Delete", "Supprimer")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t(
              "Products.DeleteConfirmTitle",
              "Êtes-vous sûr de vouloir supprimer ce groupe ?"
            )}
          </DialogTitle>
          <DialogDescription>
            {t(
              "Products.DeleteConfirmDescription",
              "Cette action est irréversible."
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowConfirm(false)}>
            {t("Products.Form.Cancel", "Annuler")}
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              handleDelete();
              setShowConfirm(false);
            }}
          >
            {t("Products.Actions.Delete", "Supprimer")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
