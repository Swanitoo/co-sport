"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Détecter la locale depuis le pathname
function getLocaleFromPathname() {
  if (typeof window !== "undefined") {
    const pathname = window.location.pathname;
    const segments = pathname.split("/").filter(Boolean);
    const locales = ["fr", "en", "es"];
    if (segments.length > 0 && locales.includes(segments[0])) {
      return segments[0];
    }
  }
  return null;
}

// Obtenir les labels en fonction de la locale
function getLabels() {
  const locale = getLocaleFromPathname();

  if (locale === "fr") {
    return {
      Light: "Clair",
      Dark: "Sombre",
      System: "Système",
    };
  } else if (locale === "es") {
    return {
      Light: "Claro",
      Dark: "Oscuro",
      System: "Sistema",
    };
  } else {
    return {
      Light: "Light",
      Dark: "Dark",
      System: "System",
    };
  }
}

export function ModeToggle() {
  const { setTheme, theme } = useTheme();
  const labels = getLabels();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="hover:bg-accent">
          <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={theme === "light" ? "bg-accent/50" : ""}
        >
          {labels.Light}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={theme === "dark" ? "bg-accent/50" : ""}
        >
          {labels.Dark}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={theme === "system" ? "bg-accent/50" : ""}
        >
          {labels.System}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
