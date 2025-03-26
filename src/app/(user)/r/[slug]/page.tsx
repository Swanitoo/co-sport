import { currentUser } from "@/auth/current-user";
import { Layout } from "@/components/layout";
import { Header } from "@/features/layout/Header";
import { cn } from "@/lib/utils";
import { prisma } from "@/prisma";
import { redirect } from "next/navigation";
import { ProcessReviewStep } from "./ProcessReviewStep";

export default async function RoutePage(
  props: {
    params: Promise<{ slug: string }>;
  }
) {
  const params = await props.params;
  const user = await currentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const decodedSlug = decodeURIComponent(params.slug);

  const product = await prisma.product.findFirst({
    where: {
      slug: decodedSlug,
    },
    include: {
      memberships: {
        where: {
          userId: user.id,
          status: "APPROVED",
        },
      },
      reviews: {
        where: {
          userId: user.id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              socialLink: true,
            },
          },
        },
      },
    },
  });

  if (!product) {
    return (
      <>
        <Header />
        <Layout>
          <div className="flex min-h-screen flex-col items-center justify-center">
            <h1 className="mb-4 text-2xl font-bold">Produit non trouvé</h1>
            <p>Désolé, nous n'avons pas pu trouver le produit demandé.</p>
          </div>
        </Layout>
      </>
    );
  }

  if (product.memberships.length === 0) {
    return (
      <>
        <Header />
        <Layout>
          <div className="flex min-h-screen flex-col items-center justify-center">
            <h1 className="mb-4 text-2xl font-bold">Accès refusé</h1>
            <p>Vous devez être un membre approuvé pour laisser un avis.</p>
          </div>
        </Layout>
      </>
    );
  }

  return (
    <>
      <Header />
      <Layout>
        <div className={cn("h-full w-full flex flex-col items-center py-4")}>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold">{product.name}</h1>
          </div>
          <div className="flex-1">
            <ProcessReviewStep product={product} />
          </div>
        </div>
      </Layout>
    </>
  );
}
