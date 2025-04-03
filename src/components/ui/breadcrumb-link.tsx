"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode, useState, useTransition } from "react";

interface BreadcrumbLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  locale?: string;
}

export function BreadcrumbLink({
  href,
  children,
  className,
  locale,
}: BreadcrumbLinkProps) {
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

    // Keep loading state for at least 500ms to ensure loader is visible
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  return (
    <Link href={href} onClick={handleClick} className={className}>
      <span className="flex items-center gap-1">
        {children}
        {showLoader && (
          <Loader2 className="ml-1 size-3 animate-spin text-primary" />
        )}
      </span>
    </Link>
  );
}
