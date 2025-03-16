"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmailPreference } from "@prisma/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { updateEmailPreferences } from "./email-preferences.action";

type EmailPreferencesProps = {
  userId: string;
  initialPreferences?: EmailPreference | null;
};

export const EmailPreferencesDialog = ({
  userId,
  initialPreferences,
}: EmailPreferencesProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preferences, setPreferences] = useState({
    marketingEmails: initialPreferences?.marketingEmails ?? true,
    newMessagesEmails: initialPreferences?.newMessagesEmails ?? true,
    joinRequestEmails: initialPreferences?.joinRequestEmails ?? true,
    membershipEmails: initialPreferences?.membershipEmails ?? true,
    reviewEmails: initialPreferences?.reviewEmails ?? true,
  });

  useEffect(() => {
    if (initialPreferences) {
      setPreferences({
        marketingEmails: initialPreferences.marketingEmails,
        newMessagesEmails: initialPreferences.newMessagesEmails,
        joinRequestEmails: initialPreferences.joinRequestEmails,
        membershipEmails: initialPreferences.membershipEmails,
        reviewEmails: initialPreferences.reviewEmails,
      });
    }
  }, [initialPreferences]);

  const handleSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      const result = await updateEmailPreferences(formData);

      if (result.success) {
        toast.success("Préférences email mises à jour", {
          description: "Vos préférences ont été enregistrées avec succès",
          duration: 3000,
          icon: "🔔",
        });
        setOpen(false);
      } else {
        toast.error("Erreur", {
          description:
            result.error ||
            "Un problème est survenu lors de la mise à jour de vos préférences",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour des préférences:", error);
      toast.error("Erreur", {
        description:
          "Un problème est survenu lors de la mise à jour de vos préférences",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={buttonVariants({ size: "lg", variant: "outline" })}
          variant="outline"
          size="lg"
        >
          Gérer mes préférences email
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Préférences d'emails</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="mt-4 space-y-4">
          <input type="hidden" name="userId" value={userId} />

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="marketingEmails"
                name="marketingEmails"
                checked={preferences.marketingEmails}
                onCheckedChange={(checked) => {
                  setPreferences({
                    ...preferences,
                    marketingEmails: checked === true,
                  });
                }}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="marketingEmails"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Emails marketing
                </label>
                <p className="text-sm text-muted-foreground">
                  Recevoir des emails concernant les nouvelles fonctionnalités
                  et les offres.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="newMessagesEmails"
                name="newMessagesEmails"
                checked={preferences.newMessagesEmails}
                onCheckedChange={(checked) => {
                  setPreferences({
                    ...preferences,
                    newMessagesEmails: checked === true,
                  });
                }}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="newMessagesEmails"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Nouveaux messages
                </label>
                <p className="text-sm text-muted-foreground">
                  Recevoir des notifications par email lorsque vous recevez de
                  nouveaux messages.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="joinRequestEmails"
                name="joinRequestEmails"
                checked={preferences.joinRequestEmails}
                onCheckedChange={(checked) => {
                  setPreferences({
                    ...preferences,
                    joinRequestEmails: checked === true,
                  });
                }}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="joinRequestEmails"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Demandes d'adhésion
                </label>
                <p className="text-sm text-muted-foreground">
                  Recevoir des notifications lorsque quelqu'un demande à
                  rejoindre votre activité.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="membershipEmails"
                name="membershipEmails"
                checked={preferences.membershipEmails}
                onCheckedChange={(checked) => {
                  setPreferences({
                    ...preferences,
                    membershipEmails: checked === true,
                  });
                }}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="membershipEmails"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Adhésions acceptées
                </label>
                <p className="text-sm text-muted-foreground">
                  Recevoir des notifications lorsque votre demande d'adhésion
                  est acceptée.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="reviewEmails"
                name="reviewEmails"
                checked={preferences.reviewEmails}
                onCheckedChange={(checked) => {
                  setPreferences({
                    ...preferences,
                    reviewEmails: checked === true,
                  });
                }}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="reviewEmails"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Nouveaux avis
                </label>
                <p className="text-sm text-muted-foreground">
                  Recevoir des notifications lorsqu'un nouvel avis est laissé
                  sur votre activité.
                </p>
              </div>
            </div>
          </div>

          <Button type="submit" className="mt-6 w-full" disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : "Enregistrer les préférences"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
