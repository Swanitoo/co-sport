import { Badge } from "@/components/ui/badges/badge.schemas";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";
import Image from "next/image";

interface BadgeCardProps {
  badge: Badge;
  isCompleted: boolean;
  completedAt?: Date;
  compact?: boolean; // Mode compact pour l'affichage dans le tableau de bord
}

export const BadgeCard = ({
  badge,
  isCompleted,
  completedAt,
  compact = false,
}: BadgeCardProps) => {
  // Version compacte pour l'affichage dans le tableau de bord
  if (compact) {
    return (
      <div
        className={cn(
          "flex flex-row items-center rounded-md p-2 h-[42px]",
          isCompleted
            ? "bg-primary/10 text-primary"
            : "bg-muted/50 text-muted-foreground"
        )}
      >
        <div className="mr-2 shrink-0">
          <Image
            src={badge.icon}
            alt={badge.name}
            width={28}
            height={28}
            className={cn("size-7", !isCompleted && "grayscale")}
          />
        </div>
        <span className="line-clamp-1 flex-1 text-left text-xs font-medium leading-tight">
          {badge.name}
        </span>
      </div>
    );
  }

  // Version standard (carte complète)
  return (
    <Card className={`overflow-hidden ${isCompleted ? "border-primary" : ""}`}>
      <CardHeader
        className={`${isCompleted ? "bg-primary/10" : "bg-muted/50"}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{badge.name}</CardTitle>
            <CardDescription>{badge.description}</CardDescription>
          </div>
          <div className="relative size-16">
            <Image
              src={badge.icon}
              alt={badge.name}
              fill
              className={isCompleted ? "opacity-100" : "opacity-50 grayscale"}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-6">
        <p className="text-sm">
          <span className="font-semibold">Critères:</span>
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {badge.requirements.totalActivities && (
            <li>
              Au moins {badge.requirements.totalActivities} activités sportives
            </li>
          )}
          {badge.requirements.elevation && (
            <li>Cumuler {badge.requirements.elevation}m de dénivelé</li>
          )}
          {badge.requirements.distance && (
            <li>Parcourir {badge.requirements.distance}km au total</li>
          )}
          {badge.requirements.sports && (
            <li>
              Pratiquer l'un des sports: {badge.requirements.sports.join(", ")}
            </li>
          )}
        </ul>
      </CardContent>

      {isCompleted && completedAt && (
        <CardFooter className="bg-primary/5 py-3 text-sm text-muted-foreground">
          Obtenu{" "}
          {formatDistance(completedAt, new Date(), {
            addSuffix: true,
            locale: fr,
          })}
        </CardFooter>
      )}
    </Card>
  );
};
