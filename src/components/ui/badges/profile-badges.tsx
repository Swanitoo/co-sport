import { StravaLogo } from "@/components/StravaLogo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { prisma } from "@/prisma";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getUserBadges } from "./badge.actions";
import { BADGES } from "./badge.config";

interface ProfileBadgesProps {
  userId: string;
}

export const ProfileBadges = async ({ userId }: ProfileBadgesProps) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      showBadges: true,
      stravaId: true,
    },
  });

  // Ne pas afficher les badges si l'utilisateur a désactivé cette option
  if (!user?.showBadges) {
    return null;
  }

  const userBadges = await getUserBadges(userId);

  if (userBadges.length === 0) {
    return null;
  }

  // Lien vers le profil Strava de l'utilisateur s'il est connecté
  const stravaProfileUrl = user.stravaId
    ? `https://www.strava.com/athletes/${user.stravaId}`
    : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <CardTitle>Badges sportifs</CardTitle>
          {stravaProfileUrl && (
            <Link
              href={stravaProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-[#FC4C02] hover:underline"
            >
              <StravaLogo className="size-4" />
              <span>Voir profil Strava</span>
              <ExternalLink className="ml-1 size-3" />
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <TooltipProvider>
            {userBadges.map((userBadge) => {
              const badge = BADGES.find((b) => b.id === userBadge.badgeId);
              if (!badge) return null;

              return (
                <Tooltip key={badge.id}>
                  <TooltipTrigger asChild>
                    <div className="relative size-14 rounded-full bg-primary/10 p-2">
                      <Image
                        src={badge.icon}
                        alt={badge.name}
                        fill
                        className="p-2"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="border border-border bg-popover/95">
                    <div className="text-center">
                      <p className="font-medium text-[#FC4C02]">{badge.name}</p>
                      <p className="text-xs text-foreground">
                        {badge.description}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
};
