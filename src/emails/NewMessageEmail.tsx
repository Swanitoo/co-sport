import { Button } from "./Button";
import EmailLayout from "./EmailLayout";
import { Text } from "./Text";

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const NewMessageEmail = ({
  productName,
  productId,
  senderName,
  messagePreview,
  messageCount,
}: {
  productName: string;
  productId: string;
  senderName: string;
  messagePreview: string;
  messageCount: number;
}) => {
  const subject =
    messageCount > 1
      ? `${messageCount} nouveaux messages dans ${productName}`
      : `Nouveau message de ${senderName} dans ${productName}`;

  return (
    <EmailLayout preview={subject}>
      <Text className="text-base font-light leading-8 text-gray-800">
        {messageCount > 1
          ? `${senderName} a envoyé ${messageCount} nouveaux messages dans "${productName}"`
          : `${senderName} a envoyé un message dans "${productName}"`}
      </Text>
      {messageCount === 1 && (
        <Text className="text-base font-light leading-8 text-gray-800 italic">
          "{messagePreview}"
        </Text>
      )}
      <Button
        className="block w-52 rounded bg-blue-600 py-3.5 text-center text-sm font-normal text-white no-underline"
        href={`${baseUrl}/products/${productId}`}
      >
        Voir la conversation
      </Button>
      <Text className="text-base font-light leading-8 text-gray-800">
        À bientôt sur Co-Sport !
      </Text>
      <Text className="text-base font-light leading-8 text-gray-800">
        L'équipe Co-Sport
      </Text>
    </EmailLayout>
  );
};

export default NewMessageEmail;
