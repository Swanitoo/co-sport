"use client";

import { useAppTranslations } from "@/components/i18n-provider";
import { buttonVariants } from "@/components/ui/button";
import { Link2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type SeeAllReviewsButtonProps = {
  slug: string;
};

export const SeeAllReviewsButton = ({ slug }: SeeAllReviewsButtonProps) => {
  const { t, locale } = useAppTranslations();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  // Combiner l'état de transition et l'état de chargement manuel
  const showLoader = isPending || isLoading;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    // Définir l'état de chargement immédiatement pour un retour visuel
    setIsLoading(true);

    // Utiliser une transition pour naviguer
    startTransition(() => {
      router.push(`/${locale}/wall/${encodeURIComponent(slug)}`);
    });

    // Garder l'état de chargement pendant au moins 500ms pour assurer la visibilité du loader
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  return (
    <Link
      href={`/${locale}/wall/${encodeURIComponent(slug)}`}
      onClick={handleClick}
      className={buttonVariants({
        size: "sm",
        variant: "outline",
      })}
      prefetch={true}
      aria-disabled={showLoader}
    >
      {showLoader ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          {t("Common.Loading", "Chargement...")}
        </>
      ) : (
        <>
          <Link2 size={16} className="mr-2" />
          {t("Products.SeeAllReviews", "Voir tous les avis")}
        </>
      )}
    </Link>
  );
};
