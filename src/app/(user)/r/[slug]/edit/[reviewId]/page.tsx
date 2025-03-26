import { currentUser } from "@/auth/current-user";
import { Layout } from "@/components/layout";
import { prisma } from "@/prisma";
import { notFound } from "next/navigation";
import { EditReviewForm } from "./EditReviewForm";

export default async function EditReviewPage(
  props: {
    params: Promise<{ slug: string; reviewId: string }>;
  }
) {
  const params = await props.params;

  const {
    slug,
    reviewId
  } = params;

  const user = await currentUser();

  if (!user?.isAdmin) {
    return (
      <Layout>
        <div className="flex min-h-screen flex-col items-center justify-center">
          <h1 className="mb-4 text-2xl font-bold">Accès refusé</h1>
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
