import { Header } from "@/features/layout/Header";
import type { LayoutParams } from "@/types/next";
import { Analytics } from '@vercel/analytics/react';

export default async function RouteLayout(props: LayoutParams<{}>) {
    return(
        <div className="h-full">
            <Header />
            <Analytics />
            {props.children}
        </div>
    )
}