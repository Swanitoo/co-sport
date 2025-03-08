"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getCountryFlag } from "@/data/country";
import { updateProfileImage } from "@/features/auth/auth.action";
import imageCompression from "browser-image-compression";
import { Pencil } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { uploadImageAction } from "../upload.action";

type Props = {
  currentImage?: string | null;
  userName?: string | null;
  userCountry?: string | null;
  size?: "default" | "lg";
};

// Types MIME autorisés pour les images
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

// Taille maximum avant compression (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const options = {
  maxSizeMB: 0.5, // Taille maximum de 500KB après compression
  maxWidthOrHeight: 1024, // Redimensionner si plus grand que 1024px
  useWebWorker: true,
  fileType: "image/webp",
  initialQuality: 0.8, // Qualité initiale de compression
};

export const ProfileImageUpload = ({
  currentImage,
  userName,
  userCountry,
  size = "default",
}: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [localImage, setLocalImage] = useState<string | null | undefined>(
    currentImage
  );

  const validateFile = (file: File): string | null => {
    // Vérifier le type MIME
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return "Le fichier doit être une image (JPG, PNG, WebP, GIF ou AVIF)";
    }

    // Vérifier la taille
    if (file.size > MAX_FILE_SIZE) {
      return "L'image ne doit pas dépasser 5MB";
    }

    return null;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Valider le fichier
    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setIsUploading(true);

      // Vérifier que c'est bien une image valide
      const isValidImage = await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = URL.createObjectURL(file);
      });

      if (!isValidImage) {
        throw new Error("Le fichier n'est pas une image valide");
      }

      // Créer une URL temporaire pour l'aperçu
      const tempUrl = URL.createObjectURL(file);
      setLocalImage(tempUrl);

      // Compresser l'image
      const compressedFile = await imageCompression(file, options);

      // Vérifier la taille après compression
      if (compressedFile.size > MAX_FILE_SIZE) {
        throw new Error("L'image est trop volumineuse même après compression");
      }

      const formData = new FormData();
      formData.append("file", compressedFile);

      const uploadResult = await uploadImageAction(formData);
      if (!uploadResult.data) {
        throw new Error(uploadResult.serverError || "Une erreur est survenue");
      }
      await updateProfileImage({ imageUrl: uploadResult.data.url });

      // Mettre à jour l'image avec l'URL finale
      setLocalImage(uploadResult.data.url);

      // Nettoyer l'URL temporaire
      URL.revokeObjectURL(tempUrl);

      toast.success("Photo de profil mise à jour avec succès");
    } catch (error) {
      // En cas d'erreur, revenir à l'image précédente
      setLocalImage(currentImage);
      toast.error(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la mise à jour de votre photo de profil"
      );
    } finally {
      setIsUploading(false);
      // Réinitialiser l'input pour permettre de sélectionner le même fichier
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="relative">
      <Avatar className={size === "lg" ? "size-32" : "size-20"}>
        <AvatarImage src={localImage || undefined} />
        <AvatarFallback>{userName?.[0]}</AvatarFallback>
      </Avatar>
      {userCountry && (
        <div className="absolute -bottom-2 -left-2 rounded-full bg-background p-1 shadow-sm">
          <span className="text-lg">{getCountryFlag(userCountry)}</span>
        </div>
      )}
      <Button
        size="icon"
        variant="secondary"
        className="absolute -bottom-2 -right-2 size-8 rounded-full"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        <Pencil className="size-4" />
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={ALLOWED_IMAGE_TYPES.join(",")}
        onChange={handleFileChange}
        aria-label="Changer la photo de profil"
      />
    </div>
  );
};
