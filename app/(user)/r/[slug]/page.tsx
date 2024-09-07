import { cn } from "@/lib/utils";
import { prisma } from "@/prisma";
import { PageParams } from "@/types/next";
import { notFound } from "next/navigation";
import { ProcessReviewStep } from "./ProcessReviewStep";

export default async function RoutePage(props: PageParams<{ slug: string }>) {
    const product = await prisma.product.findFirst({
        where: {
            slug: props.params.slug,
        },
    });

    if (!product) {
        notFound();
    }

    return (
        <div className={cn("h-full w-full flex flex-col items-center py-4 bg-gradient-to-r from-blue-800 to-indigo-900")}>
        <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold">{product.name}</h1>
        </div>
        <div className="flex-1">
            <ProcessReviewStep product={product}/>
        </div>
    </div>);
}