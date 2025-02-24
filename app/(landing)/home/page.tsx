import { currentUser } from "@/auth/current-user";
import { CTASection } from "@/features/landing/CTASection";
import { FAQSection } from "@/features/landing/FAQSection";
import { FeatureSection } from "@/features/landing/FeatureSection";
import { FooterSection } from "@/features/landing/Footersection";
import { HeroSection } from "@/features/landing/HeroSection";
import { LandingHeader } from "@/features/landing/LandingHeader";
import { prisma } from "@/prisma";
import { LatestProducts } from "./LatestProducts";

export default async function Home() {
  const user = await currentUser();

  const latestProducts = await prisma.product.findMany({
    where: {
      enabled: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 9,
    select: {
      id: true,
      name: true,
      sport: true,
      level: true,
      description: true,
      venueName: true,
      venueAddress: true,
      user: {
        select: {
          name: true,
          country: true,
          image: true,
        },
      },
      _count: {
        select: {
          reviews: true,
        },
      },
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="h-16" />
      <LandingHeader />
      <HeroSection />
      <LatestProducts products={latestProducts} isAuthenticated={!!user} />
      <FeatureSection />
      <FAQSection />
      <CTASection />
      <FooterSection />
    </div>
  );
}
