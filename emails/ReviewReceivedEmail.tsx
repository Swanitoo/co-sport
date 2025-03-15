import { Section } from "@react-email/components";
import { Button } from "./Button";
import EmailLayout from "./EmailLayout";
import { Text } from "./Text";

// Utiliser l'URL définie dans l'environnement ou une valeur par défaut
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://co-sport.com";

export const ReviewReceivedEmail = ({
  productName,
  productId,
  reviewerName,
  rating,
  reviewText,
}: {
  productName: string;
  productId: string;
  reviewerName: string;
  rating: number;
  reviewText: string;
}) => {
  // S'assurer que les valeurs sont valides
  const safeProductName = productName || "votre activité";
  const safeReviewerName = reviewerName || "Un utilisateur";
  const safeRating =
    typeof rating === "number" && rating >= 0 && rating <= 5 ? rating : 0;
  const safeReviewText = reviewText || "Aucun commentaire laissé.";

  // Générer les étoiles selon la note
  const stars = "★".repeat(safeRating) + "☆".repeat(5 - safeRating);

  return (
    <EmailLayout
      preview={`Nouvel avis de ${safeReviewerName} sur votre activité`}
    >
      <Section className="mb-3 text-center">
        <Text className="text-3xl">⭐</Text>
      </Section>

      <Text className="text-center text-lg font-bold text-yellow-500">
        Nouvel avis sur votre activité
      </Text>

      <Text>Bonjour,</Text>

      <Text>
        <strong>{safeReviewerName}</strong> vient de laisser un avis sur votre
        activité "<strong>{safeProductName}</strong>".
      </Text>

      <Section className="my-4 rounded-lg bg-slate-50 p-4">
        <Text className="font-medium">
          {safeReviewerName}{" "}
          <span className="ml-2 text-yellow-500">{stars}</span>{" "}
          <span className="ml-2 text-slate-500">({safeRating}/5)</span>
        </Text>
        <Text className="italic">"{safeReviewText}"</Text>
      </Section>

      <Text>
        Les avis des participants sont précieux pour améliorer votre activité et
        attirer de nouveaux membres !
      </Text>

      <Section className="my-8 text-center">
        <Button href={`${baseUrl}/products/${productId}/reviews`}>
          Voir tous les avis
        </Button>
      </Section>

      <Text>À bientôt sur Co-Sport !</Text>

      <Text>
        <em>L'équipe Co-Sport</em>
      </Text>
    </EmailLayout>
  );
};

export default ReviewReceivedEmail;
