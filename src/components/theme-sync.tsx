"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";

// Ce composant synchronise le thème en utilisant localStorage
export const ThemeSync = () => {
  const { theme, setTheme } = useTheme();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    try {
      // Récupérer le thème stocké
      const cookieTheme = document.cookie
        .split("; ")
        .find((row) => row.startsWith("theme="))
        ?.split("=")[1];
      const localTheme = localStorage.getItem("theme");
      const storedTheme = cookieTheme || localTheme || "system";

      // Appliquer le thème stocké si différent
      if (storedTheme && storedTheme !== theme) {
        setTheme(storedTheme);
      }
    } catch (error) {
      console.error("Erreur lors de l'initialisation du thème:", error);
    }
  }, []); // S'exécute uniquement au montage

  useEffect(() => {
    if (!theme) return;

    try {
      // Sauvegarder le thème dans localStorage et cookie
      localStorage.setItem("theme", theme);
      document.cookie = `theme=${theme};path=/;max-age=31536000;SameSite=Lax`;

      // Mettre à jour l'attribut de la balise html
      document.documentElement.setAttribute("data-theme", theme);
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du thème:", error);
    }
  }, [theme]);

  // Gérer les changements de thème entre les onglets
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "theme" && e.newValue && e.newValue !== theme) {
        setTheme(e.newValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [theme, setTheme]);

  return null;
};
