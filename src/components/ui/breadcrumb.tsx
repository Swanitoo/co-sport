"use client";

import { cn } from "@/lib/utils";
import { ChevronRight, Home, Loader2 } from "lucide-react";
import * as React from "react";
import { BreadcrumbLink } from "./breadcrumb-link";

interface BreadcrumbItem {
  href?: string;
  label: React.ReactNode;
  isLoading?: boolean;
}

interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  homeHref?: string;
  className?: string;
  separator?: React.ReactNode;
}

export function Breadcrumb({
  items,
  homeHref = "/",
  className,
  separator = (
    <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/70" />
  ),
  ...props
}: BreadcrumbProps) {
  return (
    <nav
      aria-label="Fil d'Ariane"
      className={cn("flex items-center space-x-1.5 text-sm", className)}
      {...props}
    >
      <BreadcrumbLink
        href={homeHref}
        className="flex items-center text-muted-foreground hover:text-foreground"
      >
        <Home className="size-4" aria-label="Accueil" />
      </BreadcrumbLink>

      {items.length > 0 && separator}

      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item.href ? (
            <BreadcrumbLink
              href={item.href}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              {item.label}
              {item.isLoading && (
                <Loader2 className="ml-1 size-3 animate-spin text-primary" />
              )}
            </BreadcrumbLink>
          ) : (
            <div className="flex items-center gap-1 text-foreground">
              {item.label}
              {item.isLoading && (
                <Loader2 className="ml-1 size-3 animate-spin text-primary" />
              )}
            </div>
          )}
          {index < items.length - 1 && separator}
        </React.Fragment>
      ))}
    </nav>
  );
}
