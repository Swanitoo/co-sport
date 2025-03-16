"use client";

import dynamic from "next/dynamic";

// Import dynamique du composant AdsenseAd
const DynamicAdsenseAd = dynamic(
  () => import("./AdsenseAd").then((mod) => mod.AdsenseAd),
  { ssr: false }
);

interface AdBannerProps {
  slot: string;
  className?: string;
}

export const AdBanner = ({ slot, className = "" }: AdBannerProps) => {
  return (
    <div className="my-6 flex justify-center">
      <DynamicAdsenseAd
        slot={slot}
        format="auto"
        style={{ display: "block", textAlign: "center" }}
        className={`h-[90px] w-full max-w-[728px] overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800 ${className}`}
      />
    </div>
  );
};
