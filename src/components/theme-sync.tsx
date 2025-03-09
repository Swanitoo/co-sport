"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

// Ce composant synchronise le thème en utilisant localStorage
export const ThemeSync = () => {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    // Fonction pour appliquer le thème depuis le stockage
    const applyStoredTheme = () => {
      // Essayer de lire d'abord un thème de la page via un cookie (plus fiable entre les domaines)
      const cookieTheme = document.cookie
        .split("; ")
        .find((row) => row.startsWith("theme="))
        ?.split("=")[1];

      // Ensuite essayer localStorage
      const localTheme = localStorage.getItem("theme");

      // Utiliser le cookie, puis localStorage, ou rester sur le thème actuel
      const storedTheme = cookieTheme || localTheme || theme;

      if (storedTheme && storedTheme !== theme) {
        setTheme(storedTheme);
      }
    };

    // Appliquer le thème stocké au montage
    applyStoredTheme();

    // Synchroniser les changements entre différentes instances
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "theme" && e.newValue && e.newValue !== theme) {
        setTheme(e.newValue);
      }
    };

    // Sauvegarder le thème actuel dans localStorage ET dans un cookie quand il change
    if (theme) {
      localStorage.setItem("theme", theme);
      document.cookie = `theme=${theme};path=/;max-age=31536000;SameSite=Lax`;
    }

    // Vérifier le thème toutes les secondes pour les cas où le stockage n'est pas synchronisé
    const intervalId = setInterval(applyStoredTheme, 1000);

    window.addEventListener("storage", handleStorageChange);

    // Nettoyer lors du démontage
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [theme, setTheme]);

  return null; // Ce composant ne rend rien
};
