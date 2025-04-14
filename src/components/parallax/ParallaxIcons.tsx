"use client";

import { SPORTS } from "@/app/(customer)/products/[slug]/edit/product.schema";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { memo, useEffect, useMemo, useState } from "react";

type IconConfig = {
  icon: string;
  x: number;
  y: number;
  size: number;
  blur: number;
  opacity: number;
  initialZ: number;
  delay: number;
};

// Version simple du StaticIcon sans IntersectionObserver
const StaticIcon = memo(({ config }: { config: IconConfig }) => {
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
});

StaticIcon.displayName = "StaticIcon";

// Version simple du composant de contenu
const IconsContent = memo(() => {
  const icons = useMemo(() => {
    if (typeof window === "undefined") return [];

    const generatedIcons: IconConfig[] = [];
    const maxIconsPerSport = window.innerWidth < 768 ? 1 : 2;

    SPORTS.forEach((sport, sportIndex) => {
      for (let i = 0; i < maxIconsPerSport; i++) {
        const initialZ = Math.random() * 100 - 50;
        const baseOpacity = Math.random() * 0.15 + 0.15;
        const isMobile = window.innerWidth < 768;

        generatedIcons.push({
          icon: sport.icon,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 20 + 35,
          blur: isMobile
            ? Math.random() * 0.8 + 0.3
            : Math.random() * 1.5 + 0.5,
          opacity: isMobile ? baseOpacity * 1.5 : baseOpacity,
          initialZ,
          delay: Math.random() * 0.3 + sportIndex * 0.01,
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
      aria-hidden="true"
    >
      <AnimatePresence>
        {icons.map((config, index) => (
          <StaticIcon key={index} config={config} />
        ))}
      </AnimatePresence>
    </div>
  );
});

IconsContent.displayName = "IconsContent";

// Version très simple du composant principal
export const ParallaxIcons = () => {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Montage immédiat
    setIsMounted(true);
  }, []);

  // Ne rendre que sur la page d'accueil
  if (pathname && !["/", "/fr", "/es", "/en"].includes(pathname)) return null;

  return isMounted ? <IconsContent /> : null;
};
