"use client";

import { ThemeSync } from "@/components/theme-sync";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/features/theme/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

// Créer un contexte pour la navigation
type NavigationContextType = {
  startNavigation: () => void;
  isNavigating: boolean;
};

const NavigationContext = createContext<NavigationContextType>({
  startNavigation: () => {},
  isNavigating: false,
});

// Hook pour utiliser le contexte de navigation
export function useNavigation() {
  return useContext(NavigationContext);
}

// Composant de barre de progression pour les transitions de page
function NavigationEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const { isNavigating } = useNavigation();

  // Animation de la barre de progression
  useEffect(() => {
    if (!isNavigating) {
      return;
    }

    setProgress(0);
    let animationFrame: number;
    let startTime: number;

    // Animation de la progression
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      // Progression de 0 à 90% en 400ms (plus rapide)
      const newProgress = Math.min(90, elapsed / 4);
      setProgress(newProgress);

      if (elapsed < 800 && newProgress < 90) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isNavigating]);

  // Reset lors du changement de route
  useEffect(() => {
    setProgress(100);
    const timer = setTimeout(() => {
      setProgress(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // Si nous ne sommes pas en train de naviguer, ne rien afficher
  if (!isNavigating && progress === 0) return null;

  return (
    <div className="fixed left-0 top-0 z-50 h-1.5 w-full bg-primary/10">
      <div
        className="h-full bg-primary"
        style={{
          width: `${progress}%`,
          transition: "width 0.1s ease-in-out",
          boxShadow: "0 0 8px hsl(var(--primary) / 0.5)",
        }}
      />
    </div>
  );
}

// Intercepteur de clics pour démarrer l'animation avant la navigation
function NavigationInterceptor({ children }: PropsWithChildren) {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Réinitialiser l'état quand la route change effectivement
  useEffect(() => {
    // Réinitialiser l'état après un délai pour permettre l'animation de fin
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // Fonction pour démarrer l'animation de navigation
  const startNavigation = () => {
    setIsNavigating(true);
  };

  // Intercepter tous les clics sur les liens dans l'application
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Vérifier si l'élément cliqué est un lien ou est à l'intérieur d'un lien
      const findLinkElement = (element: Element | null): Element | null => {
        if (!element) return null;
        if (element.tagName === "A" || element.getAttribute("role") === "link")
          return element;
        if (element.hasAttribute("href")) return element;
        return findLinkElement(element.parentElement);
      };

      const target = e.target as Element;
      const linkElement = findLinkElement(target);

      if (linkElement && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        // Ne pas intercepter les liens externes
        const href = linkElement.getAttribute("href");
        if (
          href &&
          !href.startsWith("http") &&
          !href.startsWith("mailto:") &&
          !href.startsWith("tel:")
        ) {
          startNavigation();
        }
      }

      // Intercepter les clics sur des éléments qui pourraient déclencher une navigation
      if (
        target.closest("[data-navigation]") ||
        target.getAttribute("data-navigation") === "true"
      ) {
        startNavigation();
        return;
      }

      // Pour les boutons qui déclenchent une navigation
      const button = target.closest("button");
      if (
        button &&
        // Éviter les boutons de formulaire
        !(
          button.getAttribute("type") === "submit" ||
          button.getAttribute("type") === "reset"
        ) &&
        // Éviter les boutons désactivés
        !button.hasAttribute("disabled") &&
        // Éviter les boutons qui contrôlent des menus/popups
        !button.getAttribute("aria-haspopup") &&
        !button.getAttribute("aria-controls")
      ) {
        startNavigation();
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <NavigationContext.Provider value={{ startNavigation, isNavigating }}>
      {children}
    </NavigationContext.Provider>
  );
}

const queryClient = new QueryClient();

export type ProvidersProps = PropsWithChildren & {
  userId?: string;
};

export const Providers = ({ children, userId }: ProvidersProps) => {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ThemeSync />
        <QueryClientProvider client={queryClient}>
          <NavigationInterceptor>
            <Toaster />
            <NavigationEvents />
            {children}
          </NavigationInterceptor>
        </QueryClientProvider>
      </ThemeProvider>
    </SessionProvider>
  );
};
