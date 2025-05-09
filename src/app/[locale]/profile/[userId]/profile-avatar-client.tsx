"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ProfileAvatarClient({
  image,
  name,
  className = "",
}: {
  image: string | null;
  name: string | null;
  className?: string;
}) {
  const firstName = name?.split(" ")[0] || "Utilisateur";

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
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
  };

  return (
    <Avatar className={className}>
      <AvatarImage
        src={image || undefined}
        alt={`photo de profil de ${firstName}`}
        onError={handleImageError}
      />
      <AvatarFallback>{name?.[0]}</AvatarFallback>
    </Avatar>
  );
}
