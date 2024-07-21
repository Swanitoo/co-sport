import { Layout, LayoutTitle } from "@/components/layout";
import type { PageParams } from "@/types/next";
import { ProductForm } from "../[productId]/edit/ProductForm";
import { prisma } from "@/prisma";
import { AlertTriangle } from "lucide-react";
import { PricingSection } from "@/features/landing/PricingSection";
import { requiredCurrentUser } from "@/auth/current-user";

export default async function RoutePage(props: PageParams<{}>) {

    const user = await requiredCurrentUser();

    const isAutorized =
        user.plan === "PREMIUM"
            ? true
            : (await prisma.product.count({
                where: {
                    userId: user.id,
                },
            })) < 1;

    if (!isAutorized) {
        return (
            <Layout>
                <LayoutTitle>Create product</LayoutTitle>
                <p>
                    <AlertTriangle className="inline" />
                    Sorry, you need to upgrade to our premium plan to create more products.
                </p>
                <PricingSection />
            </Layout>
        )
    }
    return (
        <Layout>
            <LayoutTitle>
                Create product
            </LayoutTitle>
            <ProductForm />
        </Layout>
    )
}