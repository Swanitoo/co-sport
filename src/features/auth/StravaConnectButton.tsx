"use client";

import { Button } from "@/components/ui/button";
import { Cable } from "lucide-react";
import { connectStravaAction } from "./auth.action";

export const StravaConnectButton = () => {
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={() => {
        connectStravaAction();
      }}
    >
      <Cable size={16} className="mr-2" />
      Connexion
    </Button>
  );
};
