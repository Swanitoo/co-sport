"use client";

import { useAppTranslations } from "@/components/i18n-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LocalizedLink } from "@/components/ui/localized-link";
import {
  HelpCircle,
  Home,
  LayoutDashboard,
  LogOut,
  MessageSquare,
} from "lucide-react";
import { signOut } from "next-auth/react";
import React, { useState } from "react";

export type LoggedInDropdownProps = {
  userId: string;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  pendingRequestsCount?: number;
  unreadMessagesCount?: number;
  approvedRequestsCount?: number;
  unreadReviewsCount?: number;
  children: React.ReactNode;
};

export const LoggedInDropdown = ({
  userId,
  user,
  pendingRequestsCount = 0,
  unreadMessagesCount = 0,
  approvedRequestsCount = 0,
  unreadReviewsCount = 0,
  children,
}: LoggedInDropdownProps) => {
  const { t, locale } = useAppTranslations();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    setOpen(false);
    await signOut({
      callbackUrl: `/${locale}/`,
    });
  };

  const totalNotifications =
    pendingRequestsCount +
    unreadMessagesCount +
    approvedRequestsCount +
    unreadReviewsCount;

  const triggerElement =
    React.isValidElement(children) && totalNotifications > 0
      ? React.cloneElement(
          children as React.ReactElement,
          {},
          React.Children.map(children.props.children, (child) => child),
          <div
            key="notification-badge"
            className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white"
          >
            {totalNotifications}
          </div>
        )
      : children;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>{triggerElement}</DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <LocalizedLink
            href="/"
            className="flex items-center gap-2"
            onClick={() => setOpen(false)}
          >
            <Home className="size-4" />
            {t("Navigation.Home", "Accueil")}
          </LocalizedLink>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <LocalizedLink
            href="/dashboard"
            className="flex items-center gap-2"
            onClick={() => setOpen(false)}
          >
            <div className="relative">
              <LayoutDashboard className="size-4" />
              {(unreadMessagesCount > 0 ||
                approvedRequestsCount > 0 ||
                unreadReviewsCount > 0 ||
                pendingRequestsCount > 0) && (
                <span className="absolute -right-2 -top-2 flex size-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] text-white">
                  {unreadMessagesCount +
                    approvedRequestsCount +
                    unreadReviewsCount +
                    pendingRequestsCount}
                </span>
              )}
            </div>
            {t("Navigation.Dashboard", "Tableau de bord")}
          </LocalizedLink>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <LocalizedLink
            href="/products"
            className="flex items-center gap-2"
            onClick={() => setOpen(false)}
          >
            <MessageSquare className="size-4" />
            {t("Navigation.Products", "Annonces")}
          </LocalizedLink>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <LocalizedLink
            href="/support"
            className="flex items-center gap-2"
            onClick={() => setOpen(false)}
          >
            <HelpCircle className="size-4" />
            {t("Navigation.Support", "Support")}
          </LocalizedLink>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex items-center gap-2 text-red-600 focus:bg-red-50 focus:text-red-600"
          onClick={handleSignOut}
        >
          <LogOut className="size-4" />
          {t("Navigation.SignOut", "Déconnexion")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
