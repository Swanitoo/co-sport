"use client";

import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { signInAction } from "./auth.action";

export const SignInButton = () => {
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={() => {
        signInAction();
      }}
    >
      <User size={16} className="sm:mr-2" />
      <span className="hidden sm:inline">Connexion</span>
    </Button>
  );
};
