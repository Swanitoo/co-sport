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
} from "@/components/ui/dialog";
import { Handshake } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type SupportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
};

export const SupportModal = ({
  isOpen,
  onClose,
  onContinue,
}: SupportModalProps) => {
  const { t } = useAppTranslations();
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = () => {
    setIsLoading(true);
    // Simuler un délai pour montrer le chargement
    setTimeout(() => {
      setIsLoading(false);
      onContinue();
    }, 300);
  };

  // Gérer la fermeture de la modal, que ce soit par la croix ou en cliquant à l'extérieur
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      // Exécuter également la fonction demandée lorsqu'on ferme avec la croix
      onContinue();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("Support.Modal.Title", "Soutenez co-sport.com")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "Support.Modal.Description",
              "Pour maintenir ce service gratuit et continuer à développer de nouvelles fonctionnalités, nous comptons sur le soutien de notre communauté. Voici comment vous pouvez contribuer :"
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center gap-4 py-4">
          {/* Widget Buy Me a Coffee */}
          <a
            href="https://www.buymeacoffee.com/swanmarin"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=swanmarin&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff"
              alt="Buy Me A Coffee"
              className="size-auto"
            />
          </a>

          <Link href="/partnership" className="inline-block w-full">
            <Button
              className="w-full justify-between py-4 text-base"
              variant="outline"
            >
              <div className="flex items-center">
                <Handshake className="mr-2 size-4" />
                <span>{t("Support.Modal.Partner", "Devenir partenaire")}</span>
              </div>
            </Button>
          </Link>

          <p className="mt-2 text-sm text-muted-foreground">
            {t(
              "Support.Modal.Future",
              "À l'avenir, co-sport.com pourrait intégrer des publicités ciblées et non-intrusives ou des partenariats pour maintenir le service, mais nous nous engageons à toujours proposer une expérience de qualité."
            )}
          </p>
        </div>

        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={handleContinue}
            disabled={isLoading}
          >
            {isLoading
              ? t("Common.Loading", "Chargement...")
              : t("Support.Modal.ContinueWithout", "Continuer sans soutenir")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
