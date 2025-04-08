"use client";

import confetti from "canvas-confetti";
import { useEffect, useState } from "react";

type ConfettiType = "celebration" | "success" | "donation";

interface ConfettiProps {
  trigger: boolean;
  type?: ConfettiType;
  duration?: number;
}

/**
 * Composant qui lance une animation de confettis lorsque trigger passe à true
 */
export const Confetti = ({
  trigger,
  type = "celebration",
  duration = 3000,
}: ConfettiProps) => {
  const [isTriggered, setIsTriggered] = useState(false);

  useEffect(() => {
    if (trigger && !isTriggered) {
      setIsTriggered(true);

      // Choisir le style de confettis selon le type
      switch (type) {
        case "celebration":
          launchFullScreenConfetti();
          break;
        case "success":
          launchSuccessConfetti();
          break;
        case "donation":
          launchDonationConfetti();
          break;
      }

      // Réinitialiser après la durée spécifiée
      const timer = setTimeout(() => {
        setIsTriggered(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [trigger, type, duration, isTriggered]);

  // Animation de confettis sur tout l'écran
  const launchFullScreenConfetti = () => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#26a65b", "#1e8bc3", "#f9690e", "#f22613"],
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#26a65b", "#1e8bc3", "#f9690e", "#f22613"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  // Animation de confettis pour les succès (plus modérée)
  const launchSuccessConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#26a65b", "#2ecc71", "#a2d5c6", "#b8e994"],
    });
  };

  // Animation de confettis pour les dons (style festif)
  const launchDonationConfetti = () => {
    const defaults = {
      spread: 360,
      ticks: 100,
      gravity: 0.5,
      decay: 0.94,
      startVelocity: 30,
      particleCount: 100,
      scalar: 1.2,
      shapes: ["star", "circle"] as confetti.Shape[],
      colors: ["#ffd700", "#ffc0cb", "#ff8c00", "#ff0000", "#ffa500"],
    };

    confetti({
      ...defaults,
      origin: { x: 0.5, y: 0.5 },
    });
  };

  // Composant invisible
  return null;
};

/**
 * Fonction utilitaire pour lancer des confettis depuis n'importe où dans l'application
 */
export const fireConfetti = (
  type: ConfettiType = "celebration",
  duration = 3000
) => {
  switch (type) {
    case "celebration":
      {
        const duration = 3 * 1000;
        const end = Date.now() + duration;

        (function frame() {
          confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ["#26a65b", "#1e8bc3", "#f9690e", "#f22613"],
          });
          confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ["#26a65b", "#1e8bc3", "#f9690e", "#f22613"],
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        })();
      }
      break;
    case "success":
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#26a65b", "#2ecc71", "#a2d5c6", "#b8e994"],
      });
      break;
    case "donation":
      {
        const defaults = {
          spread: 360,
          ticks: 100,
          gravity: 0.5,
          decay: 0.94,
          startVelocity: 30,
          particleCount: 100,
          scalar: 1.2,
          shapes: ["star", "circle"] as confetti.Shape[],
          colors: ["#ffd700", "#ffc0cb", "#ff8c00", "#ff0000", "#ffa500"],
        };

        confetti({
          ...defaults,
          origin: { x: 0.5, y: 0.5 },
        });
      }
      break;
  }
};
