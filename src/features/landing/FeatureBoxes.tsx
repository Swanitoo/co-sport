"use client";

import { useAppTranslations } from "@/components/i18n-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
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
import { useRouter } from "next/navigation";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";

type FeatureBoxesProps = {
  isAuthenticated: boolean;
};

// Type pour les positions des icônes
type IconPosition = {
  initialX: number;
  initialY: number;
  finalX: number;
  finalY: number;
};

// Type pour les props de FeatureCard
type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
  iconPositions: IconPosition[];
};

export const FeatureCard = React.memo(
  ({
    icon,
    title,
    description,
    className,
    iconPositions,
  }: FeatureCardProps) => {
    return (
      <div
        className={cn(
          "feature-card relative rounded-lg bg-card p-6 shadow-md transition-all duration-300 hover:shadow-lg",
          className
        )}
      >
        <div className="mb-4 text-primary">
          <span className="relative inline-block size-10">
            <div className="will-change-only-transform absolute left-0 top-0">
              {icon}
            </div>
            {iconPositions.map((pos: IconPosition, idx: number) => (
              <div
                key={idx}
                className="feature-icon-auxiliary absolute"
                style={
                  {
                    "--init-x": `${pos.initialX}px`,
                    "--init-y": `${pos.initialY}px`,
                    "--final-x": `${pos.finalX}px`,
                    "--final-y": `${pos.finalY}px`,
                  } as React.CSSProperties
                }
              >
                {icon}
              </div>
            ))}
          </span>
        </div>
        <h3 className="mb-2 text-lg font-medium text-card-foreground">
          {title}
        </h3>
        <p className="optimize-text text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    );
  }
);

FeatureCard.displayName = "FeatureCard";

// Mémoiser le composant StravaLogo
const StravaLogo = memo(({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
  </svg>
));

StravaLogo.displayName = "StravaLogo";

export const FeatureBoxes = memo(({ isAuthenticated }: FeatureBoxesProps) => {
  const { t } = useAppTranslations();
  const router = useRouter();
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);
  const isMobileRef = useRef(false);

  // Calculer les positions pour les icônes auxiliaires - memoized
  const getIconPositions = useCallback((index: number, total: number) => {
    const angle = (index * 2 * Math.PI) / total;
    const mainIconRadius = 24;
    const initialX = Math.round(Math.cos(angle) * mainIconRadius * 1.5);
    const initialY = Math.round(Math.sin(angle) * mainIconRadius * 1.5);
    const distance = 60;
    const finalX = Math.round(Math.cos(angle) * distance);
    const finalY = Math.round(Math.sin(angle) * distance);

    return {
      initialX,
      initialY,
      finalX,
      finalY,
    };
  }, []);

  // Calculer toutes les positions à l'avance - memoized
  const getPrecomputedPositions = useCallback(
    (auxiliaryIcons: React.ReactNode[]) => {
      return auxiliaryIcons.map((_, i) =>
        getIconPositions(i, auxiliaryIcons.length)
      );
    },
    [getIconPositions]
  );

  // Fonction pour rediriger conditionnellement - memoized
  const handleRedirect = useCallback(
    (path: string) => {
      if (isAuthenticated) {
        router.push(path);
      } else {
        router.push(`/api/auth/signin?callbackUrl=${encodeURIComponent(path)}`);
      }
    },
    [isAuthenticated, router]
  );

  useEffect(() => {
    // Vérifier si on est sur mobile
    isMobileRef.current = window.innerWidth < 768;

    if (!isMobileRef.current) return;

    // Utiliser IntersectionObserver pour détecter les cartes visibles
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const cardElement = entry.target as HTMLDivElement;
          const cardIndex = parseInt(cardElement.dataset.cardIndex || "-1");

          if (entry.isIntersecting) {
            setHoveredCardIndex(cardIndex);
          } else if (hoveredCardIndex === cardIndex) {
            setHoveredCardIndex(null);
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
  }, [hoveredCardIndex]);

  // Effet pour gérer le déploiement des icônes au survol
  useEffect(() => {
    const cardRefs = cardsRef.current;
    const handlers: {
      [key: number]: { enter: () => void; leave: () => void };
    } = {};

    cardRefs.forEach((card, cardIndex) => {
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
        iconElements.forEach((icon) => {
          const initialX = icon.getAttribute("data-initial-x");
          const initialY = icon.getAttribute("data-initial-y");
          if (initialX && initialY) {
            (
              icon as HTMLElement
            ).style.transform = `translate(calc(-50% + ${initialX}px), calc(-50% + ${initialY}px))`;
          }
        });
      };

      handlers[cardIndex] = {
        enter: handleMouseEnter,
        leave: handleMouseLeave,
      };

      card.addEventListener("mouseenter", handleMouseEnter);
      card.addEventListener("mouseleave", handleMouseLeave);
    });

    return () => {
      cardRefs.forEach((card, cardIndex) => {
        if (!card) return;
        if (handlers[cardIndex]) {
          card.removeEventListener("mouseenter", handlers[cardIndex].enter);
          card.removeEventListener("mouseleave", handlers[cardIndex].leave);
        }
      });
    };
  }, []);

  // Memoiser les features pour éviter les recalculs inutiles
  const features = React.useMemo(
    () => [
      {
        title: t("sport_femmes_title", "Sport entre femmes"),
        seoTitle: t(
          "sport_femmes_seo_title",
          "Sport entre femmes : trouvez votre partenaire en toute confiance !"
        ),
        description: t(
          "sport_femmes_description",
          "Vous êtes une femme et vous souhaitez pratiquer du sport avec d'autres femmes ? Grâce à notre système exclusif, seules les femmes ont accès à cette fonctionnalité. Trouvez des partenaires sportives près de chez vous, selon votre niveau et vos préférences, en toute sécurité et convivialité."
        ),
        shortDescription: t(
          "sport_femmes_short_description",
          "Vous êtes une femme et vous souhaitez pratiquer du sport avec d'autres femmes ? Grâce à notre système exclusif, trouvez des partenaires sportives près de chez vous en toute sécurité."
        ),
        cta: t("sport_femmes_cta", "Rejoignez la communauté féminine"),
        icon: <PersonStanding className="size-12 text-pink-500" />,
        bgColor: "from-pink-50 via-pink-100 to-rose-50",
        iconBgColor: "bg-pink-100",
        auxiliaryIcons: [
          <Activity key="activity" className="size-8 text-pink-400" />,
          <ShieldCheck key="shield" className="size-10 text-pink-300" />,
          <Users key="users" className="size-8 text-rose-400" />,
        ],
        keywords: t(
          "sport_femmes_keywords",
          "sport entre femmes, partenaires sportives, communauté sportive féminine, sport en toute sécurité, trouver une partenaire de sport"
        ),
        metaDescription: t(
          "sport_femmes_meta_description",
          "Rejoignez une communauté 100% féminine pour pratiquer du sport avec des partenaires de confiance."
        ),
        path: "/products",
      },
      {
        title: t(
          "partenaires_sportifs_title",
          "Trouvez des partenaires sportifs qui vous correspondent !"
        ),
        seoTitle: t(
          "partenaires_sportifs_seo_title",
          "Trouvez des partenaires sportifs qui vous correspondent !"
        ),
        description: t(
          "partenaires_sportifs_description",
          "Vous cherchez un partenaire de sport qui vous ressemble ? Grâce à nos filtres avancés et aux données Strava, vous pouvez trouver des sportifs selon : Votre sport préféré (course, escalade, fitness, etc.), votre niveau (débutant, intermédiaire, expert), votre localisation et vos disponibilités, votre culture, nationalité et langue pour un maximum d'affinité. Que vous soyez à la recherche d'un partenaire de running au même rythme que vous ou d'un joueur de tennis de votre niveau, notre algorithme vous trouve le match parfait !"
        ),
        shortDescription: t(
          "partenaires_sportifs_short_description",
          "Vous cherchez un partenaire de sport qui vous ressemble ? Grâce à nos filtres avancés et aux données Strava, trouvez des sportifs selon votre sport, niveau, localisation et affinités culturelles."
        ),
        cta: t("partenaires_sportifs_cta", "Trouvez votre partenaire idéal"),
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
        keywords: t(
          "partenaires_sportifs_keywords",
          "trouver un partenaire sportif, match sportif parfait, sport selon niveau et localisation, filtre sportif avancé, affinités sportives"
        ),
        metaDescription: t(
          "partenaires_sportifs_meta_description",
          "Utilisez nos filtres intelligents pour trouver un partenaire sportif qui correspond à votre niveau, sport et culture."
        ),
        path: "/products",
      },
      {
        title: t(
          "coach_sportif_title",
          "Trouvez un coach sportif ou un guide professionnel en quelques clics !"
        ),
        seoTitle: t(
          "coach_sportif_seo_title",
          "Trouvez un coach sportif ou un guide professionnel en quelques clics !"
        ),
        description: t(
          "coach_sportif_description",
          "Vous cherchez un coach personnel, un guide de haute montagne ou un autre professionnel du sport ? Sur notre plateforme, vous pouvez réserver directement des experts qualifiés selon vos besoins : Coachs sportifs (musculation, fitness, running, yoga…), Guides de haute montagne et moniteurs spécialisés, Préparateurs physiques et experts en nutrition, Professeurs de sport et encadrants professionnels. Comparez les profils, lisez les avis et réservez le bon professionnel en toute simplicité."
        ),
        shortDescription: t(
          "coach_sportif_short_description",
          "Vous cherchez un coach personnel ou un guide professionnel ? Réservez directement des experts qualifiés : coachs sportifs, guides de montagne, préparateurs physiques et plus encore."
        ),
        cta: t("coach_sportif_cta", "Trouvez votre expert sportif"),
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
        keywords: t(
          "coach_sportif_keywords",
          "coach sportif en ligne, réserver un coach, guide de haute montagne, professionnel du sport, entraîneur personnel"
        ),
        metaDescription: t(
          "coach_sportif_meta_description",
          "Trouvez un coach ou un professionnel du sport adapté à vos besoins : fitness, montagne, nutrition et plus encore."
        ),
        path: "/products",
      },
    ],
    [t]
  );

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h3 className="mb-8 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          {t("features_title", "Nos fonctionnalités phares")}
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
});

FeatureBoxes.displayName = "FeatureBoxes";
