"use client";

import { SPORTS } from "@/app/(customer)/products/[slug]/edit/product.schema";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type IconConfig = {
  icon: string;
  x: number;
  y: number;
  size: number;
  blur: number;
  opacity: number;
  initialZ: number;
  delay: number; // Délai d'apparition
};

const StaticIcon = ({ config }: { config: IconConfig }) => {
  return (
    <motion.div
      className="absolute will-change-transform [transform-style:preserve-3d]"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: config.opacity, scale: 1 }}
      transition={{
        duration: 0.8,
        delay: config.delay,
        ease: "easeOut",
      }}
      style={{
        left: `${config.x}%`,
        top: `${config.y}%`,
        zIndex: config.initialZ,
        fontSize: config.size,
        filter: `blur(${config.blur}px)`,
      }}
    >
      {config.icon}
    </motion.div>
  );
};

const IconsContent = () => {
  const icons = useMemo(() => {
    // Sécurité supplémentaire pour s'assurer qu'on est côté client
    if (typeof window === "undefined") return [];

    const generatedIcons: IconConfig[] = [];
    SPORTS.forEach((sport, sportIndex) => {
      for (let i = 0; i < 2; i++) {
        const initialZ = Math.random() * 100 - 50;

        // Augmentation légère de l'opacité et réduction du flou pour une meilleure visibilité
        const baseOpacity = Math.random() * 0.15 + 0.15; // Augmentation de 0.05 à 0.15 min
        const isMobile = window.innerWidth < 768;

        generatedIcons.push({
          icon: sport.icon,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 20 + 35,
          // Réduction du flou pour les appareils mobiles
          blur: isMobile
            ? Math.random() * 0.8 + 0.3
            : Math.random() * 1.5 + 0.5,
          // Augmentation de l'opacité pour une meilleure visibilité
          opacity: isMobile ? baseOpacity * 1.5 : baseOpacity,
          initialZ,
          // Délai d'apparition aléatoire entre 0 et 1.5 seconde
          delay: Math.random() * 1.5 + sportIndex * 0.01,
        });
      }
    });
    return generatedIcons;
  }, []);

  if (icons.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background/90 backdrop-blur-[1.5px] [perspective:1000px]"
      style={{ height: "100vh" }}
    >
      <AnimatePresence>
        {icons.map((config, index) => (
          <StaticIcon key={index} config={config} />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Modifié pour éviter les problèmes d'hydratation et améliorer les performances
export const ParallaxIcons = () => {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Attendre le montage côté client
  if (!isMounted) return null;

  // Ne rendre que sur la page d'accueil
  if (pathname && !["/", "/fr", "/es", "/en"].includes(pathname)) return null;

  return <IconsContent />;
};
