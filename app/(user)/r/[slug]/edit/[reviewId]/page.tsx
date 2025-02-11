import { currentUser } from "@/auth/current-user";
import { Layout } from "@/components/layout";
import { prisma } from "@/prisma";
import { notFound } from "next/navigation";
import { EditReviewForm } from "./EditReviewForm";

export default async function EditReviewPage({
  params: { slug, reviewId },
}: {
  params: { slug: string; reviewId: string };
}) {
  const user = await currentUser();

  if (!user?.isAdmin) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold mb-4">Accès refusé</h1>
          <p>Vous devez être administrateur pour accéder à cette page.</p>
        </div>
      </Layout>
    );
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { user: true },
  });

  if (!review) {
    notFound();
  }

  return (
    <Layout>
      <EditReviewForm review={review} slug={slug} />
    </Layout>
  );
} 