import { currentUser } from "@/auth/current-user";
import { Layout, LayoutTitle } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Header } from "@/features/layout/Header";
import { generateMetadata as createSeoMetadata } from "@/lib/seo-config";
import { prisma } from "@/prisma";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { saveEmailPreferences } from "./actions";

// Ajouter des métadonnées pour empêcher l'indexation
export const metadata: Metadata = createSeoMetadata({
  title: "Préférences d'emails | co-sport.com",
  description:
    "Gérez vos préférences de notifications par email sur co-sport.com",
  path: "/profile/email-preferences",
  noindex: true,
});

export default async function EmailPreferencesPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  // Récupérer ou créer les préférences email de l'utilisateur
  let emailPreferences = await prisma.emailPreference.findUnique({
    where: {
      userId: user.id,
    },
  });

  if (!emailPreferences) {
    // Créer des préférences par défaut si elles n'existent pas
    emailPreferences = await prisma.emailPreference.create({
      data: {
        userId: user.id,
        marketingEmails: true,
        newMessagesEmails: true,
        joinRequestEmails: true,
        membershipEmails: true,
        reviewEmails: true,
      },
    });
  }

  return (
    <>
      <Header />
      <Layout>
        <div className="space-y-6">
          <LayoutTitle>Préférences d'emails</LayoutTitle>

          <Card>
            <CardContent className="pt-6">
              <form action={saveEmailPreferences}>
                <input type="hidden" name="userId" value={user.id} />

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="marketingEmails"
                      name="marketingEmails"
                      defaultChecked={emailPreferences.marketingEmails}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="marketingEmails"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Emails marketing
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Recevoir des emails concernant les nouvelles
                        fonctionnalités et les offres.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="newMessagesEmails"
                      name="newMessagesEmails"
                      defaultChecked={emailPreferences.newMessagesEmails}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="newMessagesEmails"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Nouveaux messages
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Recevoir des notifications par email lorsque vous
                        recevez de nouveaux messages.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="joinRequestEmails"
                      name="joinRequestEmails"
                      defaultChecked={emailPreferences.joinRequestEmails}
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
                      defaultChecked={emailPreferences.membershipEmails}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="membershipEmails"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Adhésions acceptées
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Recevoir des notifications lorsque votre demande
                        d'adhésion est acceptée.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="reviewEmails"
                      name="reviewEmails"
                      defaultChecked={emailPreferences.reviewEmails}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="reviewEmails"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Nouveaux avis
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Recevoir des notifications lorsqu'un nouvel avis est
                        laissé sur votre activité.
                      </p>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="mt-6">
                  Enregistrer les préférences
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </>
  );
}
