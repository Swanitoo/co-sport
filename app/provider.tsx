"use client"

import { ThemeProvider } from "@/features/theme/ThemesProvider";
import { PropsWithChildren } from "react";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient()

export type ProvidersProps = PropsWithChildren; 

export const Provider = (props: ProvidersProps) => {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            >
            <QueryClientProvider client={queryClient}>
            <Toaster />
            {props.children}
            </QueryClientProvider>
        </ThemeProvider>
    );
}