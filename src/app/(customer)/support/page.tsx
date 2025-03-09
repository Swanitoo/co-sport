import { requiredCurrentUser } from "@/auth/current-user";
import { Layout, LayoutTitle } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateMetadata as createSeoMetadata } from "@/lib/seo-config";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactForm } from "./ContactForm";
import { FeedbackForm } from "./FeedbackForm";

// Configuration pour forcer le rendu dynamique et désactiver la génération statique
export const dynamic = "force-dynamic";
export const generateStaticParams = undefined;

// Activation de l'ISR pour cette page
export const revalidate = 3600; // Revalider toutes les heures (la page de support change rarement)

// Composant de secours pendant le chargement
function FormSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-1/3 rounded bg-muted"></div>
      <div className="h-20 w-full rounded bg-muted"></div>
      <div className="h-10 w-1/4 rounded bg-muted"></div>
    </div>
  );
}

export default async function SupportPage() {
  await requiredCurrentUser();

  return (
    <Layout>
      <LayoutTitle>Support</LayoutTitle>
      <Card className="p-6">
        <Tabs defaultValue="contact" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="contact">Nous contacter</TabsTrigger>
            <TabsTrigger value="feedback">Donner son avis</TabsTrigger>
          </TabsList>
          <TabsContent value="contact" className="mt-6">
            <Suspense fallback={<FormSkeleton />}>
              <ContactForm />
            </Suspense>
          </TabsContent>
          <TabsContent value="feedback" className="mt-6">
            <Suspense fallback={<FormSkeleton />}>
              <FeedbackForm />
            </Suspense>
          </TabsContent>
        </Tabs>
      </Card>
    </Layout>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  return createSeoMetadata({
    title: "Support et Contact | co-sport.com",
    description:
      "Besoin d'aide ? Contactez notre équipe de support ou laissez-nous vos commentaires pour améliorer votre expérience sur co-sport.com.",
    path: "/support",
  });
}
