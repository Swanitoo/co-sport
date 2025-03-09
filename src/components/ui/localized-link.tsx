"use client";

import { useLocalizedLink } from "@/hooks/useLocalizedLink";
import { default as NextLink, LinkProps as NextLinkProps } from "next/link";
import { PropsWithChildren } from "react";

export interface LocalizedLinkProps extends Omit<NextLinkProps, "href"> {
  href: string;
  preserveLocale?: boolean;
  className?: string;
}

/**
 * Composant Link qui préserve automatiquement la langue actuelle
 * @param href Chemin relatif sans la langue (ex: "/products")
 * @param preserveLocale S'il faut préserver la langue (défaut: true)
 * @param children Contenu du lien
 * @returns Composant Link avec le chemin localisé
 */
export const LocalizedLink = ({
  href,
  preserveLocale = true,
  children,
  className,
  ...props
}: PropsWithChildren<LocalizedLinkProps>) => {
  const { getLocalizedPath } = useLocalizedLink();

  // Si preserveLocale est false ou si le lien est externe, on ne modifie pas le href
  const isExternal =
    href.startsWith("http") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:");
  const finalHref =
    !preserveLocale || isExternal ? href : getLocalizedPath(href);

  return (
    <NextLink href={finalHref} className={className} {...props}>
      {children}
    </NextLink>
  );
};
