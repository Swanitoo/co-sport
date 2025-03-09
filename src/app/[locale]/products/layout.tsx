import { Header } from "@/components/header";
import { ReactNode } from "react";

export default function ProductsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
