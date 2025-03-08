"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const ProfileAvatar = ({
  image,
  name,
  className = "",
}: {
  image: string | null;
  name: string | null;
  className?: string;
}) => {
  return (
    <Avatar className={className}>
      <AvatarImage
        src={image || undefined}
        onError={(e) => {
          const img = e.currentTarget;
          if (img.src.includes("vercel-storage.com")) {
            const googleImage = image?.replace(
              "vercel-storage.com",
              "googleusercontent.com"
            );
            if (googleImage) {
              img.src = googleImage;
            }
          }
        }}
      />
      <AvatarFallback>{name?.[0]}</AvatarFallback>
    </Avatar>
  );
};
