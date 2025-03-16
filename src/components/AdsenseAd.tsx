"use client";

import { useEffect, useRef } from "react";

interface AdsenseAdProps {
  client?: string;
  slot: string;
  format?: "auto" | "rectangle" | "vertical" | "horizontal";
  style?: React.CSSProperties;
  className?: string;
  responsive?: boolean;
}

export const AdsenseAd = ({
  client = "ca-pub-9578850534114306",
  slot,
  format = "auto",
  style = { display: "block" },
  className = "",
  responsive = true,
}: AdsenseAdProps) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      // Assurez-vous que window.adsbygoogle existe
      if (adRef.current && typeof window !== "undefined") {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error("Erreur lors du chargement de l'annonce AdSense:", err);
    }
  }, []);

  return (
    <div ref={adRef} className={className}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        {...(responsive ? { "data-full-width-responsive": "true" } : {})}
      />
    </div>
  );
};

// Définir la propriété window.adsbygoogle
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}
