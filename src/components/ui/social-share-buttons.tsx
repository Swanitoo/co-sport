"use client";

import { Button } from "@/components/ui/button";
import { Facebook, Link, MessageCircle, MessageSquare } from "lucide-react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

type SocialShareProps = {
  title: string;
  description?: string;
  imageUrl?: string;
  className?: string;
};

export const SocialShareButtons = ({
  title,
  description = "",
  imageUrl = "",
  className = "",
}: SocialShareProps) => {
  const pathname = usePathname();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://co-sport.com";
  const url = `${baseUrl}${pathname}`;

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    messenger: `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=${
      process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "123456789"
    }&redirect_uri=${encodedUrl}`,
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
        toast.success("Contenu partagé avec succès");
      } catch (error) {
        console.error("Erreur lors du partage:", error);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    toast.success("Lien copié dans le presse-papier");
  };

  const openShareWindow = (shareUrl: string) => {
    window.open(shareUrl, "_blank", "width=600,height=600");
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => openShareWindow(shareUrls.facebook)}
        className="flex items-center gap-2 border-blue-600 bg-blue-600 text-white hover:border-blue-700 hover:bg-blue-700"
        aria-label="Partager sur Facebook"
      >
        <Facebook size={16} className="text-white" />
        <span className="hidden sm:inline">Facebook</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => openShareWindow(shareUrls.messenger)}
        className="flex items-center gap-2 border-blue-500 bg-blue-500 text-white hover:border-blue-600 hover:bg-blue-600"
        aria-label="Partager via Messenger"
      >
        <MessageCircle size={16} className="text-white" />
        <span className="hidden sm:inline">Messenger</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => openShareWindow(shareUrls.whatsapp)}
        className="flex items-center gap-2 border-green-600 bg-green-600 text-white hover:border-green-700 hover:bg-green-700"
        aria-label="Partager via WhatsApp"
      >
        <MessageSquare size={16} className="text-white" />
        <span className="hidden sm:inline">WhatsApp</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => openShareWindow(shareUrls.twitter)}
        className="flex items-center gap-2 border-black bg-black text-white hover:border-gray-800 hover:bg-gray-800"
        aria-label="Partager sur X (Twitter)"
      >
        <span className="font-semibold">X</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyLink}
        className="flex items-center gap-2 border-gray-600 bg-gray-600 text-white hover:border-gray-700 hover:bg-gray-700"
        aria-label="Copier le lien"
      >
        <Link size={16} className="text-white" />
        <span className="hidden sm:inline">Copier</span>
      </Button>
    </div>
  );
};
