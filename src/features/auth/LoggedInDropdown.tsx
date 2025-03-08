"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HelpCircle,
  Home,
  LayoutDashboard,
  LogOut,
  MessageSquare,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

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
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/",
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
    <DropdownMenu>
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
          <Link href="/" className="flex items-center gap-2">
            <Home className="size-4" />
            Accueil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="flex items-center gap-2">
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
            Tableau de bord
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/products" className="flex items-center gap-2">
            <MessageSquare className="size-4" />
            Annonces
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/support" className="flex items-center gap-2">
            <HelpCircle className="size-4" />
            Support
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex items-center gap-2 text-red-600 focus:bg-red-50 focus:text-red-600"
          onClick={handleSignOut}
        >
          <LogOut className="size-4" />
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
