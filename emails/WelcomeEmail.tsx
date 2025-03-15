import { Hr, Link, Section } from "@react-email/components";
import { Button } from "./Button";
import EmailLayout from "./EmailLayout";
import { Text } from "./Text";

// Le baseUrl est maintenant géré directement dans EmailLayout
// On peut le récupérer depuis l'environnement
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://co-sport.com";

export const WelcomeEmail = ({ name }: { name: string }) => {
  // S'assurer que le nom est valide
  const safeName = name || "cher utilisateur";

  return (
    <EmailLayout preview="Bienvenue sur Co-Sport !">
      <Text>Bonjour {safeName},</Text>

      <Text>
        <strong>Bienvenue sur Co-Sport !</strong> Nous sommes ravis de vous
        compter parmi notre communauté de sportifs.
      </Text>

      <Text>Sur Co-Sport, vous pouvez :</Text>

      <Section className="pl-4">
        <Text>• Créer des annonces pour vos activités sportives</Text>
        <Text>• Rejoindre des groupes existants pour pratiquer ensemble</Text>
        <Text>• Échanger avec d'autres passionnés de sport</Text>
        <Text>• Suivre vos performances et progresser</Text>
      </Section>

      <Text>
        Pour commencer, vous pouvez explorer les annonces existantes ou créer
        votre première activité sportive.
      </Text>

      <Section className="my-8 text-center">
        <Button href={`${baseUrl}/products`}>Découvrir les annonces</Button>
      </Section>

      <Hr className="my-6 border-slate-200" />

      <Text>
        Pour toute question, n'hésitez pas à consulter notre{" "}
        <Link href={`${baseUrl}/support`} className="text-blue-600 underline">
          page d'aide
        </Link>{" "}
        ou à nous contacter directement via notre formulaire de contact.
      </Text>

      <Text>À bientôt sur Co-Sport !</Text>

      <Text>
        <em>Swan, fondateur de co-sport.com</em>
      </Text>
    </EmailLayout>
  );
};

export default WelcomeEmail;
