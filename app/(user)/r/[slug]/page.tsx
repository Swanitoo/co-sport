import { currentUser } from "@/auth/current-user";
import { Layout } from "@/components/layout";
import { cn } from "@/lib/utils";
import { prisma } from "@/prisma";
import { PageParams } from "@/types/next";
import { redirect } from "next/navigation";
import { ProcessReviewStep } from "./ProcessReviewStep";

export default async function RoutePage(props: PageParams<{ slug: string }>) {
    const user = await currentUser();
    console.log("👤 Utilisateur connecté:", JSON.stringify(user, null, 2));

    if (!user) {
        redirect("/auth/signin");
    }

    const decodedSlug = decodeURIComponent(props.params.slug);
    console.log("🔍 Slug décodé:", decodedSlug);

    const product = await prisma.product.findFirst({
        where: {
            slug: decodedSlug,
        },
        include: {
            memberships: {
                where: {
                    userId: user.id,
                    status: "APPROVED"
                }
            },
            reviews: {
                where: {
                    userId: user.id
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            socialLink: true,
                        }
                    }
                }
            }
        }
    });

    if (!product) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <h1 className="text-2xl font-bold mb-4">Produit non trouvé</h1>
                    <p>Désolé, nous n'avons pas pu trouver le produit demandé.</p>
                </div>
            </Layout>
        );
    }

    if (product.memberships.length === 0) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <h1 className="text-2xl font-bold mb-4">Accès refusé</h1>
                    <p>Vous devez être un membre approuvé pour laisser un avis.</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className={cn("h-full w-full flex flex-col items-center py-4")}>
                <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold">{product.name}</h1>
                </div>
                <div className="flex-1">
                    <ProcessReviewStep product={product}/>
                </div>
            </div>
        </Layout>
    );
}