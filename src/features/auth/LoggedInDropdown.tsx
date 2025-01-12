"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation } from "@tanstack/react-query";
import {
  CreditCard,
  Home,
  LayoutDashboard,
  Loader2,
  LogOut,
  Square,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PropsWithChildren } from "react";
import { toast } from "sonner";
import { setupCustomerPortal, singOutAction } from "./auth.action";

export type LoggedInDropdownProps = PropsWithChildren;

export const LoggedInDropdown = (props: LoggedInDropdownProps) => {
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
      <DropdownMenuTrigger asChild>{props.children}</DropdownMenuTrigger>
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
          onClick={() => {
            singOutAction();
          }}
        >
          <LogOut size={16} className="mr-2" />
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
