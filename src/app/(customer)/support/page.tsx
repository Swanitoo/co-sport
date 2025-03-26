import { requiredCurrentUser } from "@/auth/current-user";
import { Layout, LayoutTitle } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateMetadata as createSeoMetadata } from "@/lib/seo-config";
import { prisma } from "@/prisma";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminPanel } from "./AdminPanel";
import { ContactForm } from "./ContactForm";
import { FeedbackForm } from "./FeedbackForm";
import { ReviewsPanel } from "./ReviewsPanel";
import { TicketsProvider } from "./TicketsContext";
import { UserTickets } from "./UserTickets";

// Configuration pour forcer le rendu dynamique et désactiver la génération statique
export const dynamic = "force-dynamic";
export const generateStaticParams = undefined;

// Activation de l'ISR pour cette page
export const revalidate = 3600; // Revalider toutes les heures (la page de support change rarement)

// Traductions pour la page de support
const translations = {
  fr: {
    title: "Support & Aide",
    contact: "Contact",
    contactAdmin: "Contact (admin)",
    feedback: "Avis",
    admin: "Administration",
    description:
      "Besoin d'aide ou envie de partager votre expérience ? Nous sommes là pour vous aider !",
    yourTickets: "Vos tickets de support",
    testimonials: "Témoignages des utilisateurs",
    adminSection: "Section Administration",
  },
  en: {
    title: "Support & Help",
    contact: "Contact",
    contactAdmin: "Contact (admin)",
    feedback: "Feedback",
    admin: "Administration",
    description:
      "Need help or want to share your experience? We're here to help!",
    yourTickets: "Your support tickets",
    testimonials: "User testimonials",
    adminSection: "Admin Section",
  },
  es: {
    title: "Soporte & Ayuda",
    contact: "Contacto",
    contactAdmin: "Contacto (admin)",
    feedback: "Comentarios",
    admin: "Administración",
    description:
      "¿Necesitas ayuda o quieres compartir tu experiencia? ¡Estamos aquí para ayudarte!",
    yourTickets: "Tus tickets de soporte",
    testimonials: "Testimonios de usuarios",
    adminSection: "Sección de Administración",
  },
};

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

export default async function SupportPage(
  props: {
    params: Promise<{ locale?: string }>;
  }
) {
  const params = await props.params;
  const user = await requiredCurrentUser();
  const isAdmin = user.isAdmin || false;

  // Déterminer la langue
  const locale = params.locale || "fr";
  const t =
    translations[locale as keyof typeof translations] || translations.fr;

  // Récupérer les 10 derniers avis pour la section publique
  const recentReviews = await prisma.feedback.findMany({
    take: 10,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  return (
    <Layout>
      <LayoutTitle>{t.title}</LayoutTitle>
      <Card className="p-6">
        <Tabs defaultValue="contact" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="contact">
              {isAdmin ? t.contactAdmin : t.contact}
            </TabsTrigger>
            <TabsTrigger value="feedback">{t.feedback}</TabsTrigger>
          </TabsList>

          <TabsContent value="contact" className="mt-6">
            <Suspense fallback={<FormSkeleton />}>
              <TicketsProvider>
                <div className="space-y-10">
                  <ContactForm />

                  <div className="border-t pt-8">
                    <h2 className="mb-6 text-xl font-semibold">
                      {t.yourTickets}
                    </h2>
                    <UserTickets />
                  </div>

                  {isAdmin && (
                    <div className="border-t pt-8">
                      <h2 className="mb-6 text-xl font-semibold">
                        {t.adminSection}
                      </h2>
                      <AdminPanel />
                    </div>
                  )}
                </div>
              </TicketsProvider>
            </Suspense>
          </TabsContent>

          <TabsContent value="feedback" className="mt-6">
            <Suspense fallback={<FormSkeleton />}>
              <div className="space-y-10">
                <FeedbackForm />

                <div className="border-t pt-8">
                  <h2 className="mb-6 text-xl font-semibold">
                    {t.testimonials}
                  </h2>
                  <ReviewsPanel
                    reviews={recentReviews}
                    currentUser={{ isAdmin }}
                  />
                </div>
              </div>
            </Suspense>
          </TabsContent>
        </Tabs>
      </Card>
    </Layout>
  );
}

export async function generateMetadata(
  props: {
    params: Promise<{ locale?: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const locale = params.locale || "fr";
  const t =
    translations[locale as keyof typeof translations] || translations.fr;

  return createSeoMetadata({
    title: t.title + " | co-sport.com",
    description: t.description,
    path: `/support`,
  });
}
