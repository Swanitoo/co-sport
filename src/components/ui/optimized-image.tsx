"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

type OptimizedImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  fetchPriority?: "high" | "low" | "auto";
};

/**
 * Composant d'image optimisé pour Next.js 15 avec chargement différé intelligent
 * Utilise fetchPriority, preload et d'autres optimisations des Core Web Vitals
 */
export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  quality = 90,
  sizes = "100vw",
  fetchPriority = "auto",
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [ref, inView] = useInView({
    triggerOnce: true,
    rootMargin: "200px 0px", // Précharger les images à 200px avant qu'elles n'entrent dans le viewport
  });

  // Chargement automatique des images quand elles entrent dans la vue
  useEffect(() => {
    if (inView && !isLoaded) {
      // Préchargement manuel des images pour prioriser le contenu visible
      const imgLoader = new window.Image();
      imgLoader.src = src;
      imgLoader.onload = () => setIsLoaded(true);
    }
  }, [inView, isLoaded, src]);

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={{
        aspectRatio: `${width}/${height}`,
        // Réserver l'espace pour éviter le Cumulative Layout Shift (CLS)
        contentVisibility: "auto",
      }}
    >
      {(inView || priority) && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`transition-opacity duration-500 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          quality={quality}
          priority={priority}
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={fetchPriority}
          onLoad={() => setIsLoaded(true)}
          style={{
            objectFit: "cover",
            width: "100%",
            height: "100%",
          }}
        />
      )}

      {/* Placeholder pendant le chargement */}
      {!isLoaded && (
        <div
          className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-800"
          aria-hidden="true"
        />
      )}
    </div>
  );
};
