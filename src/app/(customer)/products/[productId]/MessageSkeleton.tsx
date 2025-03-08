"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function MessageSkeleton({ isCurrentUser }: { isCurrentUser: boolean }) {
  return (
    <div
      className={cn("flex w-full items-start gap-2", {
        "justify-end": isCurrentUser,
        "justify-start": !isCurrentUser,
      })}
    >
      {!isCurrentUser && <Skeleton className="size-8 shrink-0 rounded-full" />}
      <div className="space-y-2">
        {!isCurrentUser && <Skeleton className="h-4 w-20" />}
        <Skeleton className="h-10 w-[200px]" />
      </div>
    </div>
  );
}
