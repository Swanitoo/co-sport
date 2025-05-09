import PartnershipForm from "@/app/partnership/PartnershipForm";
import {
  Award,
  ChevronLeft,
  Globe,
  Handshake,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

// Métadonnées pour le SEO
export const metadata: Metadata = {
  title: "Devenez partenaire de Co-Sport | Collaboration sportive",
  description:
    "Rejoignez Co-Sport en tant que partenaire et contribuez au développement de notre jeune communauté sportive.",
  openGraph: {
    title: "Devenez partenaire de Co-Sport | Collaboration sportive",
    description:
      "Rejoignez Co-Sport en tant que partenaire et contribuez au développement de notre jeune communauté sportive.",
  },
};

export default function PartnershipPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* En-tête */}
      <header className="relative flex flex-col items-center justify-center bg-gradient-to-r from-primary/10 to-primary/5 py-16 dark:from-primary/20 dark:to-primary/10">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-8 flex justify-center">
            <Image
              src="/icon.png"
              alt="Logo Co-Sport"
              width={150}
              height={150}
              className="size-auto"
              priority
            />
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Développez votre activité avec Co-Sport
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-muted-foreground">
            Rejoignez notre jeune plateforme de mise en relation sportive et
            grandissons ensemble.
          </p>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="mx-auto w-full max-w-6xl p-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center text-base font-medium text-primary hover:text-primary/80"
        >
          <ChevronLeft className="mr-1 size-4" />
          Retour à l'accueil
        </Link>
      </div>

      {/* Section Avantages */}
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Pourquoi devenir partenaire ?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Découvrez comment nous pouvons grandir ensemble et vous aider à
              atteindre vos objectifs.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Avantage 1 */}
            <div className="flex flex-col items-center rounded-lg bg-card p-8 text-center shadow-sm transition-all hover:shadow-md sm:items-start sm:text-left">
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-300">
                <Users strokeWidth={1.5} size={24} />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Public ciblé
              </h3>
              <p className="mt-2 text-muted-foreground">
                Accédez à notre communauté naissante de sportifs passionnés, en
                pleine croissance.
              </p>
            </div>

            {/* Avantage 2 */}
            <div className="flex flex-col items-center rounded-lg bg-card p-8 text-center shadow-sm transition-all hover:shadow-md sm:items-start sm:text-left">
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                <TrendingUp strokeWidth={1.5} size={24} />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Croissance partagée
              </h3>
              <p className="mt-2 text-muted-foreground">
                Grandissons ensemble et bénéficiez d'une visibilité qui évolue
                avec notre plateforme.
              </p>
            </div>

            {/* Avantage 3 */}
            <div className="flex flex-col items-center rounded-lg bg-card p-8 text-center shadow-sm transition-all hover:shadow-md sm:items-start sm:text-left">
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-300">
                <Target strokeWidth={1.5} size={24} />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Marketing adapté
              </h3>
              <p className="mt-2 text-muted-foreground">
                Construisons ensemble des stratégies sur mesure pour atteindre
                les sportifs.
              </p>
            </div>

            {/* Avantage 4 */}
            <div className="flex flex-col items-center rounded-lg bg-card p-8 text-center shadow-sm transition-all hover:shadow-md sm:items-start sm:text-left">
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-300">
                <Globe strokeWidth={1.5} size={24} />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Présence nationale
              </h3>
              <p className="mt-2 text-muted-foreground">
                Profitez de notre ambition de couvrir toute la France à mesure
                que nous nous développons.
              </p>
            </div>

            {/* Avantage 5 */}
            <div className="flex flex-col items-center rounded-lg bg-card p-8 text-center shadow-sm transition-all hover:shadow-md sm:items-start sm:text-left">
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300">
                <Award strokeWidth={1.5} size={24} />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Innovation sportive
              </h3>
              <p className="mt-2 text-muted-foreground">
                Associez votre marque à un projet innovant qui cherche à
                révolutionner la pratique sportive.
              </p>
            </div>

            {/* Avantage 6 */}
            <div className="flex flex-col items-center rounded-lg bg-card p-8 text-center shadow-sm transition-all hover:shadow-md sm:items-start sm:text-left">
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300">
                <Handshake strokeWidth={1.5} size={24} />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Partenariat sur mesure
              </h3>
              <p className="mt-2 text-muted-foreground">
                Bénéficiez d'un partenariat adapté à vos besoins spécifiques, en
                fonction de votre budget.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Formulaire */}
      <section className="bg-primary/5 py-16 dark:bg-primary/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Devenez partenaire aujourd'hui
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Remplissez le formulaire ci-contre pour nous faire part de votre
                intérêt. Nous vous contacterons rapidement pour discuter des
                possibilités de collaboration.
              </p>

              <div className="mt-8 space-y-6">
                <div className="flex items-start">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <span className="text-xl font-bold">1</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-foreground">
                      Remplissez le formulaire
                    </h3>
                    <p className="mt-1 text-muted-foreground">
                      Partagez les détails de votre entreprise et vos attentes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <span className="text-xl font-bold">2</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-foreground">
                      Premier échange
                    </h3>
                    <p className="mt-1 text-muted-foreground">
                      Nous vous contacterons pour mieux comprendre vos besoins
                      et objectifs.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <span className="text-xl font-bold">3</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-foreground">
                      Solution personnalisée
                    </h3>
                    <p className="mt-1 text-muted-foreground">
                      Nous vous proposerons des options adaptées à votre
                      entreprise et à votre budget.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <span className="text-xl font-bold">4</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-foreground">
                      Lancement du partenariat
                    </h3>
                    <p className="mt-1 text-muted-foreground">
                      Nous mettrons en place notre collaboration et évoluerons
                      ensemble.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-card p-8 shadow-lg">
              <PartnershipForm />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ - À développer plus tard */}
    </div>
  );
}
