import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Review } from "@prisma/client";
import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";

interface ReviewItemProps {
  review: Review & {
    user?: {
      id: string;
      name: string | null;
      image: string | null;
      socialLink: string | null;
    } | null;
  };
  className?: string;
}

export function ReviewItem({ review, className }: ReviewItemProps) {
  const displayName = review.user?.name || review.name;
  const displayImage = review.user?.image || review.image;
  const profileLink = review.user?.id
    ? `/profile/${review.user.id}`
    : review.socialLink;

  const getInitials = (name?: string | null) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <Avatar className="size-8">
          {displayImage ? (
            <Image
              src={displayImage}
              alt={`Avatar de ${displayName}`}
              width={32}
              height={32}
              className="size-full rounded-full object-cover"
              unoptimized
            />
          ) : (
            <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
          )}
        </Avatar>
        <div className="flex flex-col">
          {profileLink ? (
            <Link
              href={profileLink}
              className="text-sm font-medium hover:underline"
            >
              {displayName}
            </Link>
          ) : (
            <span className="text-sm font-medium">{displayName}</span>
          )}
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={cn("text-sm", {
                  "text-yellow-500": i < review.rating,
                  "text-gray-300": i >= review.rating,
                })}
              >
                ★
              </span>
            ))}
            <span className="text-xs text-muted-foreground">
              {formatDistance(review.createdAt, new Date(), {
                addSuffix: true,
                locale: fr,
              })}
            </span>
          </div>
        </div>
      </div>
      <div className="citation">
        <p>{review.text}</p>
      </div>
    </div>
  );
}
