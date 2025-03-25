import { Section } from "@react-email/components";
import { Button } from "./Button";
import EmailLayout from "./EmailLayout";
import { Text } from "./Text";

// Utiliser l'URL définie dans l'environnement ou une valeur par défaut
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://co-sport.com";

export const MembershipAcceptedEmail = ({
  productName,
  productId,
  slug,
}: {
  productName: string;
  productId: string;
  slug?: string;
}) => {
  // S'assurer que les valeurs sont valides
  const safeProductName = productName || "l'activité";
  const safeProductId = productId || "";
  // Utiliser le slug s'il est disponible, sinon utiliser l'ID
  const urlPath = slug || safeProductId;

  return (
    <EmailLayout preview={`Demande acceptée pour ${safeProductName}`}>
      <Section className="mb-3 text-center">
        <Text className="text-3xl">✅</Text>
      </Section>

      <Text className="text-center text-lg font-bold text-yellow-500">
        Bonne nouvelle ! Votre demande a été acceptée
      </Text>

      <Text>Bonjour,</Text>

      <Text>
        Votre demande d'adhésion à l'activité "
        <strong>{safeProductName}</strong>" a été acceptée !
      </Text>

      <Text>
        Vous pouvez maintenant accéder à tous les détails de l'activité et
        communiquer avec les autres participants. N'hésitez pas à vous présenter
        dans le chat de groupe !
      </Text>

      <Section className="my-8 text-center">
        <Button href={`${baseUrl}/products/${urlPath}`}>Voir l'activité</Button>
      </Section>

      <Text className="text-sm text-slate-600">
        Rappel : en rejoignant une activité, vous vous engagez à respecter les
        règles établies par l'organisateur et à informer le groupe en cas
        d'annulation de votre participation.
      </Text>

      <Text>À bientôt sur Co-Sport !</Text>

      <Text>
        <em>L'équipe Co-Sport</em>
      </Text>
    </EmailLayout>
  );
};

export default MembershipAcceptedEmail;
