"use client";

import { useEffect } from "react";

const BuyMeCoffeeWidget = () => {
  useEffect(() => {
    // Création du script pour le widget BMC
    const script = document.createElement("script");
    script.setAttribute("data-name", "BMC-Widget");
    script.setAttribute("data-cfasync", "false");
    script.src = "https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js";
    script.setAttribute("data-id", "swanmarin");
    script.setAttribute("data-description", "Support me on Buy me a coffee!");
    script.setAttribute("data-message", "");
    script.setAttribute("data-color", "#5F7FFF");
    script.setAttribute("data-position", "Right");
    script.setAttribute("data-x_margin", "18");
    script.setAttribute("data-y_margin", "18");

    // Injection du script dans le document
    document.body.appendChild(script);

    // Nettoyage du script lors du démontage du composant
    return () => {
      try {
        // Suppression du script s'il existe encore
        if (script && script.parentNode) {
          script.parentNode.removeChild(script);
        }

        // Suppression de la frame BMC si elle existe
        const bmcFrame = document.getElementById("bmc-wbtn");
        if (bmcFrame) {
          bmcFrame.remove();
        }
      } catch (error) {
        console.error("Erreur lors du nettoyage du widget BMC:", error);
      }
    };
  }, []);

  return null; // Ce composant ne rend rien visuellement
};

export default BuyMeCoffeeWidget;
