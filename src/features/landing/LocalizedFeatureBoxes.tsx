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

              // Animer les icônes quand la carte est visible sur mobile
              const iconElements =
                cardElement.querySelectorAll("[data-final-x]");
              iconElements.forEach((icon) => {
                const finalX = icon.getAttribute("data-final-x");
                const finalY = icon.getAttribute("data-final-y");
                if (finalX && finalY) {
                  (
                    icon as HTMLElement
                  ).style.transform = `translate(calc(-50% + ${finalX}px), calc(-50% + ${finalY}px))`;
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
                  ).style.transform = `translate(calc(-50% + ${initialX}px), calc(-50% + ${initialY}px))`;
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
      path: "/annonces",
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
      path: "/annonces",
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
      path: "/annonces",
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

  // Effet pour gérer le déploiement des icônes au survol
  useEffect(() => {
    cardsRef.current.forEach((card, cardIndex) => {
      if (!card) return;

      const iconElements = card.querySelectorAll("[data-final-x]");

      const handleMouseEnter = () => {
        iconElements.forEach((icon) => {
          const finalX = icon.getAttribute("data-final-x");
          const finalY = icon.getAttribute("data-final-y");
          if (finalX && finalY) {
            (
              icon as HTMLElement
            ).style.transform = `translate(calc(-50% + ${finalX}px), calc(-50% + ${finalY}px))`;
          }
        });
      };

      const handleMouseLeave = () => {
        iconElements.forEach((icon, i) => {
          const initialX = icon.getAttribute("data-initial-x");
          const initialY = icon.getAttribute("data-initial-y");
          if (initialX && initialY) {
            (
              icon as HTMLElement
            ).style.transform = `translate(calc(-50% + ${initialX}px), calc(-50% + ${initialY}px))`;
          }
        });
      };

      card.addEventListener("mouseenter", handleMouseEnter);
      card.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        card.removeEventListener("mouseenter", handleMouseEnter);
        card.removeEventListener("mouseleave", handleMouseLeave);
      };
    });
  }, []);

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h3 className="mb-8 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          {t("Title")}
        </h3>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const iconPositions = getPrecomputedPositions(
              feature.auxiliaryIcons || []
            );
            const isHovered = index === hoveredCardIndex;

            return (
              <div
                key={index}
                ref={(el) => {
                  cardsRef.current[index] = el;
                }}
                data-card-index={index}
              >
                <Card
                  onClick={() => handleRedirect(feature.path)}
                  className={`group relative flex h-[500px] cursor-pointer flex-col overflow-hidden transition-all duration-300 ${
                    isHovered
                      ? "scale-[1.02] border-primary/50 shadow-xl"
                      : "hover:scale-[1.02] hover:border-primary/50 hover:shadow-xl"
                  }`}
                >
                  <div
                    className={`relative h-48 w-full shrink-0 bg-gradient-to-br ${
                      feature.bgColor
                    } flex items-center justify-center transition-all duration-300 ${
                      isHovered
                        ? "saturate-[1.2]"
                        : "group-hover:saturate-[1.2]"
                    }`}
                  >
                    <div className="relative">
                      {feature.auxiliaryIcons?.map((icon, i) => {
                        const positions = iconPositions[i];
                        return (
                          <div
                            key={i}
                            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-80 transition-all duration-300 ease-in-out ${
                              isHovered ? "opacity-90" : ""
                            } group-hover:opacity-90`}
                            style={{
                              transform: isHovered
                                ? `translate(calc(-50% + ${positions.finalX}px), calc(-50% + ${positions.finalY}px))`
                                : `translate(calc(-50% + ${positions.initialX}px), calc(-50% + ${positions.initialY}px))`,
                              transitionProperty: "transform, opacity",
                              zIndex: 5,
                            }}
                            data-initial-x={positions.initialX}
                            data-initial-y={positions.initialY}
                            data-final-x={positions.finalX}
                            data-final-y={positions.finalY}
                          >
                            <div
                              className={`transition-transform duration-300 ease-in-out ${
                                isHovered ? "scale-110" : ""
                              } group-hover:scale-110`}
                              style={{
                                transformOrigin: "center",
                              }}
                            >
                              {icon}
                            </div>
                          </div>
                        );
                      })}

                      <div
                        className={`relative z-10 flex items-center justify-center rounded-full ${
                          feature.iconBgColor
                        } p-4 shadow-sm transition-all duration-300 ${
                          isHovered ? "scale-110 shadow-md" : ""
                        } group-hover:scale-110 group-hover:shadow-md`}
                      >
                        {feature.icon}
                      </div>
                    </div>
                  </div>

                  <div className="flex h-[calc(500px-192px)] flex-col">
                    <div className="flex-1 p-4">
                      <CardHeader className="p-0 pb-2">
                        <CardTitle className="text-xl font-bold leading-tight">
                          <span className="line-clamp-2">{feature.title}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 pt-2">
                        <CardDescription asChild>
                          <span className="line-clamp-4 text-base leading-relaxed text-gray-600 dark:text-gray-300">
                            {feature.shortDescription}
                          </span>
                        </CardDescription>
                      </CardContent>
                    </div>

                    <div className="relative h-[60px] overflow-hidden">
                      <CardFooter
                        className={`absolute inset-x-0 bottom-0 flex h-[60px] items-center border-t bg-card p-4 shadow-sm transition-all duration-300 ease-out ${
                          isHovered ? "translate-y-0" : "translate-y-full"
                        } group-hover:translate-y-0`}
                      >
                        <div className="flex items-center gap-2 text-primary">
                          {feature.cta}
                          <ArrowRight
                            className={`size-4 transition-transform duration-300 ${
                              isHovered ? "translate-x-1" : ""
                            } group-hover:translate-x-1`}
                          />
                        </div>
                      </CardFooter>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
