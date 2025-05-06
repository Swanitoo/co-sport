"use client";

import { useAppTranslations } from "@/components/i18n-provider";
import { SupportModal } from "@/components/support/SupportModal";
import { buttonVariants } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export const CreateProductButton = () => {
  const { t } = useAppTranslations();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  // Combiner l'état de transition et l'état de chargement manuel
  const showLoader = isPending || isLoading;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    // Afficher la modal de soutien au lieu de naviguer directement
    setIsSupportModalOpen(true);
  };

  const handleSupportContinue = () => {
    // Fermer la modal de soutien
    setIsSupportModalOpen(false);

    // Définir l'état de chargement pour un retour visuel
    setIsLoading(true);

    // Utiliser une transition pour naviguer
    startTransition(() => {
      router.push("/annonces/new");
    });

    // Garder l'état de chargement pendant au moins 500ms pour assurer la visibilité du loader
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  return (
    <>
      <Link
        href="/annonces/new"
        onClick={handleClick}
        className={buttonVariants({ variant: "default" })}
        aria-disabled={showLoader}
        prefetch={true} // Précharger la page pour accélérer la navigation
      >
        {showLoader ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <Plus className="mr-2 size-4" />
        )}
        {showLoader
          ? t("Products.Creating", "Chargement...")
          : t("Products.Create", "Créer une annonce")}
      </Link>

      {/* Modal de soutien */}
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        onContinue={handleSupportContinue}
      />
    </>
  );
};
