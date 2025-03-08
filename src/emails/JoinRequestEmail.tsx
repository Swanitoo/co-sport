import { Button } from "./Button";
import EmailLayout from "./EmailLayout";
import { Text } from "./Text";

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const JoinRequestEmail = ({
  productName,
  productId,
  userName,
}: {
  productName: string;
  productId: string;
  userName: string;
}) => {
  return (
    <EmailLayout preview="Nouvelle demande d'adhésion !">
      <Text className="text-base font-light leading-8 text-gray-800">
        {userName} souhaite rejoindre votre annonce "{productName}" !
      </Text>
      <Text className="text-base font-light leading-8 text-gray-800">
        Vous pouvez consulter son profil et accepter ou refuser sa demande en
        cliquant sur le bouton ci-dessous.
      </Text>
      <Button
        className="block w-52 rounded bg-blue-600 py-3.5 text-center text-sm font-normal text-white no-underline"
        href={`${baseUrl}/products/${productId}`}
      >
        Gérer la demande
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

export default JoinRequestEmail;
