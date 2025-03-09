"use client";

import { ThemeSync } from "@/components/theme-sync";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/features/theme/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { PropsWithChildren } from "react";

const queryClient = new QueryClient();

export type ProvidersProps = PropsWithChildren & {
  userId?: string;
};

export const Providers = ({ children, userId }: ProvidersProps) => {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ThemeSync />
        <QueryClientProvider client={queryClient}>
          <Toaster />
          {children}
        </QueryClientProvider>
      </ThemeProvider>
    </SessionProvider>
  );
};
