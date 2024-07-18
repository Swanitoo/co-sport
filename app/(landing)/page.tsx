import { Button } from "@/components/ui/button";
import { HeroSection } from "@/features/landing/HeroSection";
import { LandingHeader } from "@/features/landing/LandingHeader";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-16" />
      <LandingHeader />
      <HeroSection />
      <p>Test</p>
      <Button>Test</Button>
    </div>
  );
}
