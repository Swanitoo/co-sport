import { Header } from "@/components/header";
import { ReactNode } from "react";

export default function SupportLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
