import { currentUser } from "@/auth/current-user";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LoggedInDropdown } from "@/features/auth/LoggedInDropdown";
import { LoginDialog } from "@/features/auth/LoginDialog";
import { ModeToggle } from "@/features/theme/ModeToggle";
import { getLocaleFromPathname, loadTranslations } from "@/lib/locale-utils";
import { prisma } from "@/prisma";
import { Coffee } from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";

// Type pour les traductions
type TranslationsType = {
  Navigation?: Record<string, string>;
  AppName?: string;
  [key: string]: any;
};

// Désactiver la mise en cache pour ce composant
export const dynamic = "force-dynamic";

export async function Header() {
  // Utiliser { cache: 'no-store' } pour forcer la réexécution du currentUser à chaque requête
  const user = await currentUser();

  // Obtenir le pathname depuis les headers de la requête
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "/";

  // Déterminer la locale et charger les traductions
  const locale = getLocaleFromPathname(pathname);
  const translations = (await loadTranslations(locale)) as TranslationsType;

  // Obtenir les traductions spécifiques
  const t = translations.Navigation || {};

  let pendingRequestsCount = 0;
  let unreadMessagesCount = 0;
  let approvedRequestsCount = 0;
  let unreadReviewsCount = 0;
  if (user) {
    const [pendingRequests, unreadMessages, approvedRequests, unreadReviews] =
      await Promise.all([
        prisma.membership.count({
          where: {
            product: {
              userId: user.id,
            },
            status: "PENDING",
          },
        }),
        prisma.unreadMessage.count({
          where: {
            userId: user.id,
          },
        }),
        prisma.membership.count({
          where: {
            userId: user.id,
            status: "APPROVED",
            read: false,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 derniers jours
            },
          },
        }),
        prisma.review.count({
          where: {
            product: {
              userId: user.id,
            },
            read: false,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 derniers jours
            },
          },
        }),
      ]);
    pendingRequestsCount = pendingRequests;
    unreadMessagesCount = unreadMessages;
    approvedRequestsCount = approvedRequests;
    unreadReviewsCount = unreadReviews;
  }

  // Fonction pour traduire les éléments d'interface
  const translate = (key: string, fallback: string) => {
    return t[key] || fallback;
  };

  // Créer le chemin avec le préfixe de locale
  const getLocalizedPath = (path: string) => {
    // Si le chemin commence déjà par /fr/, /en/ ou /es/, ne pas modifier
    if (path.match(/^\/(fr|en|es)\//)) return path;
    // Sinon, ajouter le préfixe de locale
    return `/${locale}${path === "/" ? "" : path}`;
  };

  return (
    <header className="w-full border-b border-border py-1">
      <div className="mx-auto flex w-full max-w-5xl flex-row items-center gap-4 px-4 py-0">
        <div className="flex-1">
          <Link
            href={getLocalizedPath("/")}
            className="mr-6 flex items-center space-x-2"
          >
            <Image src="/icon.png" alt="Logo" width={32} height={32} />
          </Link>
        </div>

        <div className="flex items-center justify-end gap-3">
          <a
            href="https://www.buymeacoffee.com/swanmarin"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="gap-1">
              <Coffee className="size-3.5" />
              <span className="hidden sm:inline-block">Soutenir</span>
            </Button>
          </a>

          {/* Séparateur vertical */}
          <div className="mx-1 h-6 w-px bg-border"></div>

          {/* Sélecteur de thème */}
          <ModeToggle />

          {/* Séparateur vertical */}
          <div className="mx-1 h-6 w-px bg-border"></div>

          {/* Sélecteur de langue */}
          <div className="flex items-center justify-center">
            <LanguageSwitcher />
          </div>

          {user ? (
            <LoggedInDropdown
              userId={user.id}
              user={{
                name: user.name,
                email: user.email,
                image: user.image,
              }}
              pendingRequestsCount={pendingRequestsCount}
              unreadMessagesCount={unreadMessagesCount}
              approvedRequestsCount={approvedRequestsCount}
              unreadReviewsCount={unreadReviewsCount}
            >
              <Button variant="ghost" className="relative size-8 rounded-full">
                <Avatar className="size-8">
                  <AvatarImage
                    src={user.image || undefined}
                    alt={user.name || ""}
                  />
                  <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                </Avatar>
              </Button>
            </LoggedInDropdown>
          ) : (
            <LoginDialog
              trigger={
                <span className="inline-block cursor-pointer">
                  <Button>{translate("SignIn", "Connexion")}</Button>
                </span>
              }
            />
          )}
        </div>
      </div>
    </header>
  );
}
