import { auth } from "@/auth/auth";
import { Layout, LayoutTitle } from "@/components/layout";
import { BadgeCard } from "@/components/ui/badges/badge-card";
import { BadgeSettings } from "@/components/ui/badges/badge-settings";
import {
  calculateUserBadges,
  getUserBadges,
} from "@/components/ui/badges/badge.actions";
import { BADGES } from "@/components/ui/badges/badge.config";
import { prisma } from "@/prisma";
import { redirect } from "next/navigation";

export default async function BadgesPage() {
  // Utilisation de la fonction auth() du système d'authentification
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const userId = session.user.id;
  const completedBadgeIds = await calculateUserBadges(userId);
  const userBadges = await getUserBadges(userId);

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    redirect("/dashboard");
  }

  return (
    <Layout>
      <div className="space-y-6">
        <LayoutTitle>Mes badges sportifs</LayoutTitle>
        <p className="mb-6 text-muted-foreground">
          Ces badges sont générés à partir de vos activités Strava et vous
          permettent de montrer votre profil sportif sans révéler vos données
          précises.
        </p>

        <BadgeSettings userId={userId} showBadges={user.showBadges} />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {BADGES.map((badge) => {
            const isCompleted = completedBadgeIds.includes(badge.id);
            const userBadge = userBadges.find((ub) => ub.badgeId === badge.id);

            return (
              <BadgeCard
                key={badge.id}
                badge={badge}
                isCompleted={isCompleted}
                completedAt={userBadge?.completedAt}
              />
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
