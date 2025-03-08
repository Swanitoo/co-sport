import { Button } from "./Button";
import EmailLayout from "./EmailLayout";
import { Text } from "./Text";

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const WelcomeEmail = ({ name }: { name: string }) => {
  return (
    <EmailLayout preview="Bienvenue sur Co-Sport !">
      <Text className="text-base font-light leading-8 text-gray-800">
        Bonjour {name},
      </Text>
      <Text className="text-base font-light leading-8 text-gray-800">
        Bienvenue sur Co-Sport ! Nous sommes ravis de vous compter parmi nous.
      </Text>
      <Text className="text-base font-light leading-8 text-gray-800">
        Sur Co-Sport, vous pouvez : - Créer des annonces pour vos activités
        sportives - Rejoindre les activités d'autres membres
      </Text>
      <Button
        className="block w-52 rounded bg-blue-600 py-3.5 text-center text-sm font-normal text-white no-underline"
        href={`${baseUrl}/products`}
      >
        Découvrir les annonces
      </Button>
      <Text className="text-base font-light leading-8 text-gray-800">
        À bientôt sur Co-Sport !
      </Text>
      <Text className="text-base font-light leading-8 text-gray-800">
        Swan, créateur de co-sport.com
      </Text>
    </EmailLayout>
  );
};

export default WelcomeEmail;
