"use client";

import { useAppTranslations } from "@/components/i18n-provider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteProductAction } from "./edit/product.action";

interface DeleteButtonProps {
  productId: string;
}

export const DeleteButton = ({ productId }: DeleteButtonProps) => {
  const { t, locale } = useAppTranslations();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const result = await deleteProductAction(productId);
      if (result.serverError) {
        toast.error(result.serverError);
        setIsLoading(false);
        setIsOpen(false);
        return;
      }

      // Immédiatement rediriger pour éviter que la page courante ne tente de se recharger
      // et essaie d'accéder à une annonce qui n'existe plus
      const redirectUrl = `/${locale}/annonces`;
      toast.success(
        t("Products.DeleteSuccess", "Annonce supprimée avec succès")
      );

      // Désactiver la mise à jour de l'état après redirection pour éviter des erreurs
      window.location.href = redirectUrl;

      // Alternative: router.replace au lieu de push pour remplacer l'historique actuel
      // router.replace(redirectUrl);
    } catch (error) {
      console.error("Erreur lors de la suppression", error);
      toast.error(
        t(
          "Products.DeleteError",
          "Une erreur est survenue lors de la suppression de l'annonce"
        )
      );
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="destructive">
          <Trash2 size={16} className="mr-2" />
          {t("Products.Actions.Delete", "Supprimer")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("Products.DeleteConfirmTitle", "Supprimer l'annonce ?")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t(
              "Products.DeleteConfirmDescription",
              "Cette action est irréversible. Toutes les données associées à cette annonce seront supprimées."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("Common.Cancel", "Annuler")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isLoading}
          >
            {isLoading
              ? t("Products.Deleting", "Suppression en cours...")
              : t("Products.Actions.Delete", "Supprimer")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
