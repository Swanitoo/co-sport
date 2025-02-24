"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HelpCircle,
  Home,
  LayoutDashboard,
  LogOut,
  Square,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PropsWithChildren } from "react";
import { singOutAction } from "./auth.action";

export type LoggedInDropdownProps = PropsWithChildren & {
  userId: string;
  pendingRequestsCount?: number;
  unreadMessagesCount?: number;
  approvedRequestsCount?: number;
  unreadReviewsCount?: number;
};

export const LoggedInDropdown = ({
  userId,
  pendingRequestsCount = 0,
  unreadMessagesCount = 0,
  approvedRequestsCount = 0,
  unreadReviewsCount = 0,
  children,
}: LoggedInDropdownProps) => {
  const router = useRouter();
  const totalNotifications =
    pendingRequestsCount +
    unreadMessagesCount +
    approvedRequestsCount +
    unreadReviewsCount;

  // const stripeSettingsMutation = useMutation({
  //   mutationFn: () => setupCustomerPortal(""),
  //   onSuccess: ({ data, serverError }) => {
  //     if (serverError || !data) {
  //       toast.error(serverError);
  //       return;
  //     }

  //     router.push(data);
  //   },
  // });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative">
          {children}
          {totalNotifications > 0 && (
            <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {totalNotifications}
            </span>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <Link href="/home" className="w-full">
            <Home size={16} className="mr-2" />
            Accueil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="relative flex w-full items-center">
            <LayoutDashboard size={16} className="mr-2" />
            Tableau de bord
            {totalNotifications > 0 && (
              <span className="ml-2 flex size-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {totalNotifications}
              </span>
            )}
          </Link>
        </DropdownMenuItem>
        {/* <DropdownMenuItem
          onClick={() => {
            stripeSettingsMutation.mutate();
          }}
        >
          {stripeSettingsMutation.isPending ? (
            <Loader2 size={16} className="mr-2" />
          ) : (
            <CreditCard size={16} className="mr-2" />
          )}
          Infos de paiement
        </DropdownMenuItem> */}
        <DropdownMenuItem asChild>
          <Link href="/products" className="w-full">
            <Square size={16} className="mr-2" />
            Annonces
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/support" className="w-full">
            <HelpCircle size={16} className="mr-2" />
            Support
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={async () => {
            await singOutAction();
            router.push("/");
          }}
        >
          <LogOut size={16} className="mr-2" />
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
