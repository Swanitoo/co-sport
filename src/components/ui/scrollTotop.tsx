// components/ScrollToTop.tsx
"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./button";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return isVisible ? (
    <Button
      className="fixed bottom-4 right-4 rounded-full"
      size="icon"
      onClick={scrollToTop}
    >
      <ArrowUp className="size-4" />
    </Button>
  ) : null;
}
