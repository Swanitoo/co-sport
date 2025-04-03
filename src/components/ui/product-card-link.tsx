"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode, useState, useTransition } from "react";
import { Card } from "./card";

interface ProductCardLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  cardClassName?: string;
}

export function ProductCardLink({
  href,
  children,
  className,
  cardClassName,
}: ProductCardLinkProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  // Combine automatic transition state with manual loading state
  const showLoader = isPending || isLoading;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    // Set loading state immediately for better visual feedback
    setIsLoading(true);

    // Use transition to navigate
    startTransition(() => {
      router.push(href);
    });

    // Keep loading state for at least 800ms to ensure loader is visible
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  return (
    <Link href={href} onClick={handleClick} className={className}>
      <Card
        className={`group relative cursor-pointer transition-all duration-300 hover:bg-accent/50 ${
          cardClassName || ""
        }`}
      >
        {children}

        {/* Loader overlay */}
        {showLoader && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-background/80 backdrop-blur-sm">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        )}
      </Card>
    </Link>
  );
}
