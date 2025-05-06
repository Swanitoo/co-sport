import { Section } from "@react-email/components";
import { Button } from "./Button";
import EmailLayout from "./EmailLayout";
import { Text } from "./Text";

// Utiliser l'URL définie dans l'environnement ou une valeur par défaut
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://co-sport.com";

export const ProductCreatedEmail = ({
  productName,
  productId,
  isFirstProduct = false,
  slug,
}: {
  productName: string;
  productId: string;
  isFirstProduct?: boolean;
  slug?: string;
}) => {
  // S'assurer que les valeurs sont valides
  const safeProductName = productName || "votre activité";
  const safeProductId = productId || "";
  const safeSlug = slug || "";

  const productLink = safeSlug
    ? `${baseUrl}/annonces/${safeSlug}`
    : `${baseUrl}/annonces/${safeProductId}`;

  return (
    <EmailLayout
      preview={
        isFirstProduct
          ? `Votre première activité ${safeProductName} a été créée !`
          : `Votre activité ${safeProductName} a été créée !`
      }
    >
      <Section className="mb-3 text-center">
        <Text className="text-3xl">🎉</Text>
      </Section>

      <Text className="text-center text-lg font-bold text-yellow-500">
        {isFirstProduct
          ? "Félicitations pour votre première annonce !"
          : "Votre activité a été créée avec succès !"}
      </Text>

      <Text>Bonjour,</Text>

      <Text>
        Votre activité "<strong>{safeProductName}</strong>" a été créée avec
        succès et est maintenant visible dans notre catalogue.
      </Text>

      {isFirstProduct && (
        <Text>
          En tant que créateur de votre première annonce, vous pouvez maintenant
          :
          <ul>
            <li>Recevoir des demandes d'adhésion de participants intéressés</li>
            <li>Communiquer avec les membres de votre groupe</li>
            <li>Organiser et planifier vos séances sportives</li>
          </ul>
        </Text>
      )}

      <Text>Pour optimiser la visibilité de votre activité, pensez à :</Text>

      <Section className="pl-4">
        <Text>• Ajouter une description détaillée</Text>
        <Text>• Préciser les horaires et la fréquence</Text>
        <Text>• Indiquer le niveau requis et le matériel nécessaire</Text>
        <Text>• Partager votre annonce sur les réseaux sociaux</Text>
      </Section>

      <Section className="my-8 text-center">
        <Button href={productLink}>Voir mon annonce</Button>
      </Section>

      <Text>À bientôt sur Co-Sport !</Text>

      <Text>
        <em>L'équipe Co-Sport</em>
      </Text>
    </EmailLayout>
  );
};

export default ProductCreatedEmail;
