import { Section } from "@react-email/components";
import { Button } from "./Button";
import EmailLayout from "./EmailLayout";
import { Text } from "./Text";

// Utiliser l'URL définie dans l'environnement ou une valeur par défaut
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://co-sport.com";

export const NewMessageEmail = ({
  productName,
  productId,
  senderName,
  messagePreview,
  messageCount = 1,
  slug,
}: {
  productName: string;
  productId: string;
  senderName: string;
  messagePreview: string;
  messageCount?: number;
  slug?: string;
}) => {
  // S'assurer que les valeurs sont valides
  const safeProductName = productName || "l'activité";
  const safeProductId = productId || "";
  const safeSenderName = senderName || "Un utilisateur";
  // Utiliser le slug s'il est disponible, sinon utiliser l'ID
  const urlPath = slug || safeProductId;

  const subject =
    messageCount > 1
      ? `${messageCount} nouveaux messages dans ${safeProductName}`
      : `Nouveau message de ${safeSenderName} dans ${safeProductName}`;

  // S'assurer que messagePreview est une chaîne de caractères valide
  const safeMessagePreview = messagePreview || "";
  const truncatedMessage =
    safeMessagePreview.length > 150
      ? safeMessagePreview.substring(0, 150) + "..."
      : safeMessagePreview;

  return (
    <EmailLayout preview={subject}>
      <Section className="mb-3 text-center">
        <Text className="text-3xl">💬</Text>
      </Section>

      <Text className="text-center text-lg font-bold text-yellow-500">
        {messageCount > 1
          ? `${messageCount} nouveaux messages`
          : "Nouveau message"}
      </Text>

      <Text>Bonjour,</Text>

      {messageCount > 1 ? (
        <Text>
          Vous avez reçu <strong>{messageCount} nouveaux messages</strong> dans
          l'activité "<strong>{safeProductName}</strong>".
        </Text>
      ) : (
        <Text>
          <strong>{safeSenderName}</strong> a envoyé un message dans l'annonce "
          <strong>{safeProductName}</strong>".
        </Text>
      )}

      <Section className="my-4 rounded-lg bg-slate-50 p-4">
        <Text className="italic">"{truncatedMessage}"</Text>
      </Section>

      <Text>
        Pour consulter {messageCount > 1 ? "tous vos messages" : "ce message"}{" "}
        et y répondre, cliquez sur le bouton ci-dessous.
      </Text>

      <Section className="my-8 text-center">
        <Button href={`${baseUrl}/annonces/${urlPath}/chat`}>
          Voir {messageCount > 1 ? "les messages" : "le message"}
        </Button>
      </Section>

      <Text className="text-sm text-slate-600">
        Note : Pour désactiver les notifications par email, rendez-vous dans les
        paramètres de votre profil.
      </Text>

      <Text>À bientôt sur Co-Sport !</Text>

      <Text>
        <em>L'équipe Co-Sport</em>
      </Text>
    </EmailLayout>
  );
};

export default NewMessageEmail;
