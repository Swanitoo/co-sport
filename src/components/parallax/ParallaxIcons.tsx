"use client";

import { SPORTS } from "@/app/(customer)/products/[productId]/edit/product.schema";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type IconConfig = {
  icon: string;
  x: number;
  y: number;
  size: number;
  blur: number;
  speed: number;
  opacity: number;
  rotationSpeed: number;
  direction: { x: number; y: number };
  initialZ: number;
};

const ParallaxIcon = ({ config }: { config: IconConfig }) => {
  const { scrollYProgress } = useScroll();
  const [dimensions, setDimensions] = useState({ width: 1, height: 1 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 15,
    mass: 0.2,
    restDelta: 0.001,
  });

  const y = useTransform(
    smoothProgress,
    [0, 1],
    [0, dimensions.height * config.speed * config.direction.y * 0.8]
  );

  const x = useTransform(
    smoothProgress,
    [0, 1],
    [0, dimensions.width * config.speed * config.direction.x * 0.3]
  );

  const z = useTransform(
    smoothProgress,
    [0, 1],
    [config.initialZ, config.initialZ + 100]
  );

  const scale = useTransform(
    z,
    [config.initialZ, config.initialZ + 100],
    [0.8, 1.2]
  );

  return (
    <motion.div
      className="absolute will-change-transform [transform-style:preserve-3d]"
      style={{
        left: `${config.x}%`,
        top: `${config.y}%`,
        x,
        y,
        z,
        scale,
        fontSize: config.size,
        filter: `blur(${config.blur}px)`,
        opacity: config.opacity,
      }}
      initial={{
        z: config.initialZ,
        scale: 0.8,
      }}
      animate={{
        z: config.initialZ + 100,
        scale: 1.2,
      }}
      transition={{
        z: {
          duration: 20,
          ease: "linear",
          repeat: Infinity,
          repeatType: "mirror",
        },
        scale: {
          duration: 20,
          ease: "linear",
          repeat: Infinity,
          repeatType: "mirror",
        },
      }}
    >
      {config.icon}
    </motion.div>
  );
};

const ParallaxContent = () => {
  const icons = useMemo(() => {
    const generatedIcons: IconConfig[] = [];
    SPORTS.forEach((sport) => {
      for (let i = 0; i < 2; i++) {
        const angle = Math.random() * Math.PI * 2;
        const initialZ = Math.random() * 100 - 50;
        generatedIcons.push({
          icon: sport.icon,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 20 + 35,
          blur: Math.random() * 1.5 + 0.5,
          speed: Math.random() * 0.4 + 0.1,
          opacity: Math.random() * 0.15 + 0.05,
          rotationSpeed: (Math.random() - 0.5) * 2,
          direction: {
            x: Math.cos(angle),
            y: Math.sin(angle),
          },
          initialZ,
        });
      }
    });
    return generatedIcons;
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 h-screen w-screen overflow-hidden bg-background/90 backdrop-blur-[1.5px] [perspective:1000px]">
      {icons.map((config, index) => (
        <ParallaxIcon key={index} config={config} />
      ))}
    </div>
  );
};

export const ParallaxIcons = () => {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Ne rien rendre côté serveur
  if (typeof window === "undefined") return null;

  // Ne rien rendre tant que le composant n'est pas monté
  if (!isMounted) return null;

  // Ne rendre que sur la page d'accueil
  if (!["/", "/fr", "/es"].includes(pathname)) return null;

  return <ParallaxContent />;
};
