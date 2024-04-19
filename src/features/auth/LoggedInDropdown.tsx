"use client";

import { signOutAction } from "./auth.action";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { PropsWithChildren } from "react";
import { LogOut } from "lucide-react";

export type LoggedInDropdownProps = PropsWithChildren

export const LoggedInDropDown = (props: LoggedInDropdownProps) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>{props.children}</DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem
                    onClick={() => {
                        signOutAction();
                    }}
                >
                    <LogOut size={16} className="mr-2" />
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}