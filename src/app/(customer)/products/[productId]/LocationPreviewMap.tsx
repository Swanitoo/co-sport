"use client";

import { useAppTranslations } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Expand, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Import dynamique du composant Map pour éviter les erreurs SSR
const MapPreview = dynamic(
  () => import("./MapPreview").then((mod) => mod.MapPreview),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-lg border">
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    ),
  }
);

interface LocationPreviewMapProps {
  latitude?: number;
  longitude?: number;
  venueName?: string;
  venueAddress?: string;
}

export const LocationPreviewMap = ({
  latitude,
  longitude,
  venueName = "",
  venueAddress,
}: LocationPreviewMapProps) => {
  const { t } = useAppTranslations();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // S'assurer que le composant est monté côté client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !latitude || !longitude) {
    return null;
  }

  return (
    <>
      <div className="relative h-40 w-full overflow-hidden rounded-xl border shadow-sm transition-all hover:shadow-md">
        <Button
          variant="secondary"
          size="sm"
          className="absolute right-2 top-2 z-10 flex items-center gap-2 rounded-lg bg-background/90 px-3 py-1 text-xs font-medium shadow-sm backdrop-blur-sm hover:bg-background"
          onClick={() => setIsOpen(true)}
        >
          <Expand className="size-3.5" />
          {t("Products.Map.ExpandMap", "Agrandir la carte")}
        </Button>
        <div className="size-full">
          <MapPreview
            latitude={latitude}
            longitude={longitude}
            venueName={venueName}
            venueAddress={venueAddress}
            miniVersion={true}
          />
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-[95dvh] max-w-[95dvw] overflow-hidden p-0 sm:rounded-xl">
          <DialogHeader className="absolute right-4 top-4 z-50 flex-row items-center justify-end space-x-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
            >
              <X className="size-4" />
              <span className="sr-only">
                {t("Products.Map.CloseMap", "Fermer")}
              </span>
            </Button>
            <DialogTitle className="sr-only">
              {t("Products.Map.LocationPreview", "Aperçu du lieu")}
            </DialogTitle>
          </DialogHeader>
          <div className="h-[95dvh] w-full">
            <MapPreview
              latitude={latitude}
              longitude={longitude}
              venueName={venueName}
              venueAddress={venueAddress}
              miniVersion={false}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
