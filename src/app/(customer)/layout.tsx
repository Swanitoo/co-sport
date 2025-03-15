import { Header } from "@/features/layout/Header";
import type { LayoutParams } from "@/types/next";
import { Analytics } from "@vercel/analytics/react";

export default async function RouteLayout(props: LayoutParams<{}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <Analytics />
      <main className="flex-1">{props.children}</main>
    </div>
  );
}
