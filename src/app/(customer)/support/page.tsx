import { requiredCurrentUser } from "@/auth/current-user";
import { Layout, LayoutTitle } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateMetadata as createSeoMetadata } from "@/lib/seo-config";
import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";
import { FeedbackForm } from "./FeedbackForm";

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
            <ContactForm />
          </TabsContent>
          <TabsContent value="feedback" className="mt-6">
            <FeedbackForm />
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
