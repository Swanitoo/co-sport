"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { LanguageSwitcher } from "./language-switcher";
import { ModeToggle } from "./mode-toggle";

interface SiteHeaderProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  pendingRequestsCount: number;
  unreadMessagesCount: number;
  approvedRequestsCount: number;
  unreadReviewsCount: number;
}

export function SiteHeader({
  user,
  pendingRequestsCount,
  unreadMessagesCount,
  approvedRequestsCount,
  unreadReviewsCount,
}: SiteHeaderProps) {
  const t = useTranslations("Navigation");

  return (
    <header className="w-full border-b border-border py-1">
      <div className="mx-auto flex w-full max-w-5xl flex-row items-center gap-4 px-4 py-0">
        <div className="flex-1">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Image src="/icon.png" alt="Logo" width={32} height={32} />
          </Link>
        </div>

        <div className="flex items-center justify-end gap-3">
          {/* Sélecteur de thème */}
          <div className="flex items-center justify-center">
            <ModeToggle />
          </div>

          {/* Séparateur vertical */}
          <div className="mx-1 h-6 w-px bg-border"></div>

          {/* Sélecteur de langue */}
          <div className="flex items-center justify-center">
            <LanguageSwitcher />
          </div>

          {/* Bouton de connexion/profil utilisateur */}
          {user ? (
            <div>
              {/* Le code de LoggedInDropdown sera migré plus tard */}
              <Button
                variant="ghost"
                className="relative ml-2 size-8 rounded-full"
              >
                <Avatar className="size-8">
                  <AvatarImage
                    src={user.image || undefined}
                    alt={user.name || ""}
                  />
                  <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                </Avatar>
              </Button>
            </div>
          ) : (
            <Link href="/auth/signin" className="ml-2">
              <Button>{t("SignIn")}</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
