"use client"

import { ThemeProvider } from "@/features/theme/ThemesProvider";
import { PropsWithChildren } from "react";
import { Toaster } from "@/components/ui/sonner";

export type ProvidersProps = PropsWithChildren; 

export const Provider = (props: ProvidersProps) => {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            >
            <Toaster />
            {props.children}
        </ThemeProvider>
    );
}