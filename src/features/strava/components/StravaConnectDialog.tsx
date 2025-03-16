import { StravaLogo } from "@/components/StravaLogo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useState } from "react";

interface StravaConnectDialogProps {
  trigger?: React.ReactNode;
  openState?: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
}

export function StravaConnectDialog({
  trigger,
  openState,
}: StravaConnectDialogProps) {
  const [localOpen, setLocalOpen] = useState(false);

  // Utiliser l'état passé en props ou l'état local
  const [open, setOpen] = openState || [localOpen, setLocalOpen];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#FC4C02]">
            <StravaLogo />
          </div>
          <DialogTitle className="text-center text-2xl">
            Connectez votre compte Strava
          </DialogTitle>
          <DialogDescription className="text-center">
            Pour utiliser les filtres de performance, vous devez connecter votre
            compte Strava afin de permettre la comparaison avec les statistiques
            des partenaires potentiels.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4 pt-4">
          <Link href="/profile" passHref>
            <Button
              onClick={() => setOpen(false)}
              className="flex w-full items-center justify-center gap-2 bg-[#FC4C02] hover:bg-[#E34902]"
            >
              <StravaLogo />
              <span>Connecter avec Strava</span>
            </Button>
          </Link>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Plus tard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
