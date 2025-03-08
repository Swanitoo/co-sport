import { Button } from "./Button";
import EmailLayout from "./EmailLayout";
import { Text } from "./Text";

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const MembershipAcceptedEmail = ({
  productName,
  productId,
}: {
  productName: string;
  productId: string;
}) => {
  return (
    <EmailLayout
      preview={`Votre demande d'adhésion à ${productName} a été acceptée !`}
    >
      <Text className="text-base font-light leading-8 text-gray-800">
        Félicitations ! Votre demande d'adhésion à "{productName}" a été
        acceptée.
      </Text>
      <Text className="text-base font-light leading-8 text-gray-800">
        Vous pouvez maintenant accéder à la conversation du groupe et interagir
        avec le(s) autre(s) membre(s).
      </Text>
      <Button
        className="block w-52 rounded bg-blue-600 py-3.5 text-center text-sm font-normal text-white no-underline"
        href={`${baseUrl}/products/${productId}`}
      >
        Voir le groupe
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

export default MembershipAcceptedEmail;
