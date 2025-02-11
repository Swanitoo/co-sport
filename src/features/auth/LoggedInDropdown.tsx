"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  LayoutDashboard,
  LogOut,
  Square
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PropsWithChildren } from "react";
import { singOutAction } from "./auth.action";

export type LoggedInDropdownProps = PropsWithChildren & {
  userId: string;
  pendingRequestsCount?: number;
};

export const LoggedInDropdown = ({ userId, pendingRequestsCount = 0, children }: LoggedInDropdownProps) => {
  const router = useRouter();

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
          {pendingRequestsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
              {pendingRequestsCount}
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
          <Link href="/dashboard" className="w-full">
            <LayoutDashboard size={16} className="mr-2" />
            Tableau de bord
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
