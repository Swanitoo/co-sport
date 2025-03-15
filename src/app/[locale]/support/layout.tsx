import { Header } from "@/features/layout/Header";
import { ReactNode } from "react";

export default function SupportLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
