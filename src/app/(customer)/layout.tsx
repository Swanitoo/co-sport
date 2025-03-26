import { Header } from "@/features/layout/Header";
import type { LayoutParams } from "@/types/next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default async function RouteLayout(props: LayoutParams<{}>) {
  await props.params; // Attendre la résolution de la promesse

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <Analytics />
      <SpeedInsights />
      <main className="flex-1">{props.children}</main>
    </div>
  );
}
