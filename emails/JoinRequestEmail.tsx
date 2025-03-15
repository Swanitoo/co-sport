import { Section } from "@react-email/components";
import { Button } from "./Button";
import EmailLayout from "./EmailLayout";
import { Text } from "./Text";

// Utiliser l'URL définie dans l'environnement ou une valeur par défaut
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://co-sport.com";

export const JoinRequestEmail = ({
  productName,
  productId,
  userName,
}: {
  productName: string;
  productId: string;
  userName: string;
}) => {
  // S'assurer que les valeurs sont valides
  const safeProductName = productName || "votre activité";
  const safeUserName = userName || "Un utilisateur";
  const safeProductId = productId || "";

  return (
    <EmailLayout preview={`Nouvelle demande d'adhésion de ${safeUserName}`}>
      <Section className="mb-3 text-center">
        <Text className="text-3xl">🔔</Text>
      </Section>

      <Text className="text-center text-lg font-bold text-yellow-500">
        Nouvelle demande d'adhésion
      </Text>

      <Text>Bonjour,</Text>

      <Text>
        <strong>{safeUserName}</strong> souhaite rejoindre votre activité "
        <strong>{safeProductName}</strong>".
      </Text>

      <Text>
        Nous vous invitons à consulter son profil et à gérer sa demande en
        cliquant sur le bouton ci-dessous.
      </Text>

      <Section className="my-8 text-center">
        <Button href={`${baseUrl}/products/${safeProductId}`}>
          Gérer la demande
        </Button>
      </Section>

      <Text className="text-sm text-slate-600">
        Si vous n'êtes pas disponible pour cette activité, vous pouvez refuser
        la demande. N'oubliez pas que des réponses rapides améliorent
        l'expérience de tous les utilisateurs.
      </Text>

      <Text>À bientôt sur Co-Sport !</Text>

      <Text>
        <em>L'équipe Co-Sport</em>
      </Text>
    </EmailLayout>
  );
};

export default JoinRequestEmail;
