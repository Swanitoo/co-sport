"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Activity,
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  Crown,
  Dumbbell,
  Globe,
  Languages,
  Mountain,
  PersonStanding,
  ShieldCheck,
  Target,
  Users,
  Utensils,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type LocalizedFeatureBoxesProps = {
  isAuthenticated: boolean;
};

// Composant Logo Strava personnalisé
const StravaLogo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
  </svg>
);

export const LocalizedFeatureBoxes = ({
  isAuthenticated,
}: LocalizedFeatureBoxesProps) => {
  const t = useTranslations("Features");
  const router = useRouter();
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);
  const isMobileRef = useRef(false);

  // Hook pour gérer l'animation des icônes auxiliaires
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Fonction pour gérer le déploiement des icônes au survol
    const handleMouseEffects = () => {
      cardsRef.current.forEach((card, cardIndex) => {
        if (!card) return;

        const iconElements = card.querySelectorAll("[data-final-x]");

        const handleMouseEnter = () => {
          if (iconElements) {
            iconElements.forEach((icon) => {
              const finalX = icon.getAttribute("data-final-x");
              const finalY = icon.getAttribute("data-final-y");
              if (finalX && finalY) {
                (
                  icon as HTMLElement
                ).style.transform = `translate(${finalX}px, ${finalY}px)`;
              }
            });
          }
        };

        const handleMouseLeave = () => {
          if (iconElements) {
            iconElements.forEach((icon) => {
              const initialX = icon.getAttribute("data-initial-x");
              const initialY = icon.getAttribute("data-initial-y");
              if (initialX && initialY) {
                (
                  icon as HTMLElement
                ).style.transform = `translate(${initialX}px, ${initialY}px)`;
              }
            });
          }
        };

        // Ajouter les écouteurs d'événements
        card.addEventListener("mouseenter", handleMouseEnter);
        card.addEventListener("mouseleave", handleMouseLeave);

        // Nettoyer
        return () => {
          card.removeEventListener("mouseenter", handleMouseEnter);
          card.removeEventListener("mouseleave", handleMouseLeave);
        };
      });
    };

    // Délai pour s'assurer que les éléments DOM sont bien chargés
    const timer = setTimeout(() => {
      handleMouseEffects();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Vérifier si on est sur mobile
    if (typeof window !== "undefined") {
      isMobileRef.current = window.innerWidth < 768;

      if (!isMobileRef.current) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const cardElement = entry.target as HTMLDivElement;
            const cardIndex = parseInt(cardElement.dataset.cardIndex || "-1");

            if (entry.isIntersecting) {
              setHoveredCardIndex(cardIndex);

              // Animer les icônes quand la carte est visible
              const iconElements =
                cardElement.querySelectorAll("[data-final-x]");
              iconElements.forEach((icon) => {
                const finalX = icon.getAttribute("data-final-x");
                const finalY = icon.getAttribute("data-final-y");
                if (finalX && finalY) {
                  (
                    icon as HTMLElement
                  ).style.transform = `translate(${finalX}px, ${finalY}px)`;
                }
              });
            } else if (hoveredCardIndex === cardIndex) {
              setHoveredCardIndex(null);

              // Réinitialiser les icônes quand la carte n'est plus visible
              const iconElements =
                cardElement.querySelectorAll("[data-final-x]");
              iconElements.forEach((icon) => {
                const initialX = icon.getAttribute("data-initial-x");
                const initialY = icon.getAttribute("data-initial-y");
                if (initialX && initialY) {
                  (
                    icon as HTMLElement
                  ).style.transform = `translate(${initialX}px, ${initialY}px)`;
                }
              });
            }
          });
        },
        {
          threshold: 0.35,
          rootMargin: "0px 0px -10% 0px",
        }
      );

      cardsRef.current.forEach((card) => {
        if (card) observer.observe(card);
      });

      return () => observer.disconnect();
    }
  }, [hoveredCardIndex]);

  // Fonction pour rediriger conditionnellement
  const handleRedirect = (path: string) => {
    if (isAuthenticated) {
      router.push(path);
    } else {
      router.push(`/api/auth/signin?callbackUrl=${encodeURIComponent(path)}`);
    }
  };

  // Définir les fonctionnalités avec des traductions
  const features = [
    {
      title: t("Step1.SportWomen"),
      shortDescription: t("Step1.SportWomenDesc"),
      cta: t("Step1.JoinCommunity"),
      icon: <PersonStanding className="size-12 text-pink-500" />,
      bgColor: "from-pink-50 via-pink-100 to-rose-50",
      iconBgColor: "bg-pink-100",
      auxiliaryIcons: [
        <Activity key="activity" className="size-8 text-pink-400" />,
        <ShieldCheck key="shield" className="size-10 text-pink-300" />,
        <Users key="users" className="size-8 text-rose-400" />,
      ],
      path: "/products",
    },
    {
      title: t("Step2.Title"),
      shortDescription: t("Step2.ExampleDescription"),
      cta: t("Step2.FindPartner"),
      icon: <Target className="size-12 text-blue-500" />,
      bgColor: "from-blue-50 via-indigo-50 to-cyan-50",
      iconBgColor: "bg-blue-100",
      auxiliaryIcons: [
        <Activity key="activity" className="size-8 text-blue-400" />,
        <Globe key="globe" className="size-10 text-blue-300" />,
        <Calendar key="calendar" className="size-8 text-cyan-400" />,
        <Languages key="languages" className="size-9 text-indigo-300" />,
        <StravaLogo key="strava" className="size-10 text-orange-500" />,
      ],
      path: "/products",
    },
    {
      title: t("Step3.Title"),
      shortDescription: t("Step3.CoachDesc"),
      cta: t("Step3.FindCoach"),
      icon: <Crown className="size-12 text-yellow-500" />,
      bgColor: "from-yellow-50 via-amber-50 to-orange-50",
      iconBgColor: "bg-yellow-100",
      auxiliaryIcons: [
        <Dumbbell key="dumbbell" className="size-8 text-amber-400" />,
        <Mountain key="mountain" className="size-10 text-orange-400" />,
        <Utensils key="nutrition" className="size-8 text-yellow-600" />,
        <Award key="award" className="size-9 text-amber-500" />,
        <BookOpen key="learn" className="size-8 text-orange-300" />,
      ],
      path: "/products",
    },
  ];

  // Calculer les positions pour les icônes auxiliaires autour du cercle principal
  const getIconPositions = (index: number, total: number) => {
    const angle = (index * 2 * Math.PI) / total;
    // Positions initiales (visibles à moitié en dehors de l'icône principale)
    const mainIconRadius = 24; // Rayon approximatif de l'icône principale
    // Valeur plus élevée pour que les icônes dépassent clairement de l'icône principale
    const initialX = Math.round(Math.cos(angle) * mainIconRadius * 1.5);
    const initialY = Math.round(Math.sin(angle) * mainIconRadius * 1.5);

    // Positions finales (déployées dans l'image) - SANS ALÉATOIRE pour éviter les erreurs d'hydratation
    const distance = 60; // Distance fixe du centre
    const finalX = Math.round(Math.cos(angle) * distance);
    const finalY = Math.round(Math.sin(angle) * distance);

    return {
      initialX: initialX.toString(),
      initialY: initialY.toString(),
      finalX: finalX.toString(),
      finalY: finalY.toString(),
    };
  };

  // Calculer toutes les positions à l'avance pour éviter les erreurs d'hydratation
  const getPrecomputedPositions = (auxiliaryIcons: React.ReactNode[]) => {
    return auxiliaryIcons.map((_, i) => {
      return getIconPositions(i, auxiliaryIcons.length);
    });
  };

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {t("Title")}
          </h2>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const iconPositions = getPrecomputedPositions(
              feature.auxiliaryIcons
            );
            return (
              <Card
                key={index}
                ref={(el) => {
                  cardsRef.current[index] = el;
                  return undefined;
                }}
                data-card-index={index}
                className={`group relative cursor-pointer overflow-hidden border-0 shadow-lg transition-all duration-300 hover:shadow-xl ${
                  hoveredCardIndex === index ? "border-2 border-primary" : ""
                }`}
                onClick={() => handleRedirect(feature.path)}
              >
                <div
                  className={`absolute inset-0 -z-10 bg-gradient-to-br ${feature.bgColor} opacity-30 dark:opacity-5`}
                />

                <CardHeader>
                  <div className="mb-3 flex">
                    <div
                      className={`relative flex size-16 items-center justify-center rounded-full ${feature.iconBgColor} transition-all duration-300 group-hover:scale-110`}
                    >
                      {feature.icon}

                      {/* Icônes auxiliaires */}
                      {feature.auxiliaryIcons.map((icon, iconIndex) => (
                        <div
                          key={iconIndex}
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
                          style={{
                            transform: `translate(${iconPositions[iconIndex].initialX}px, ${iconPositions[iconIndex].initialY}px)`,
                          }}
                          data-initial-x={iconPositions[iconIndex].initialX}
                          data-initial-y={iconPositions[iconIndex].initialY}
                          data-final-x={iconPositions[iconIndex].finalX}
                          data-final-y={iconPositions[iconIndex].finalY}
                        >
                          {icon}
                        </div>
                      ))}
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold">
                    {feature.title}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <CardDescription className="text-base">
                    {feature.shortDescription}
                  </CardDescription>
                </CardContent>

                <CardFooter>
                  <button className="group/button flex w-full items-center justify-between rounded-md bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-all hover:bg-primary/20">
                    <span>{feature.cta}</span>
                    <ArrowRight className="size-4 transition-transform group-hover/button:translate-x-1" />
                  </button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
