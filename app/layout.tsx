import { currentUser } from "@/auth/current-user";
import { getServerUrl } from "@/get-server-url";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "co-sport.com",
  description: "Trouve ton partenaire de sport et progressez enssemble !",
  metadataBase: new URL(getServerUrl()),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await currentUser();

  return (
    <html lang="en" className="h-full">
      <body className={cn(inter.className, "h-full")}>
        <Providers userId={user?.id}>{children}</Providers>
      </body>
    </html>
  );
}
