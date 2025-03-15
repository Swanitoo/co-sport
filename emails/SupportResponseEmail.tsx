import { Section } from "@react-email/components";
import EmailLayout from "./EmailLayout";
import { Text } from "./Text";

interface SupportResponseEmailProps {
  userName: string;
  subject: string;
  originalMessage: string;
  adminResponse: string;
}

export const SupportResponseEmail = ({
  userName = "Utilisateur",
  subject = "Votre demande",
  originalMessage = "Message original...",
  adminResponse = "Réponse de l'administrateur...",
}: SupportResponseEmailProps) => {
  // S'assurer que le nom est valide
  const safeName = userName || "cher utilisateur";

  return (
    <EmailLayout preview={`Nous avons répondu à votre demande : ${subject}`}>
      <Text>Bonjour {safeName},</Text>

      <Text>
        <strong>Nous avons répondu à votre demande de support.</strong>
      </Text>

      <Text>
        Sujet : <strong>{subject}</strong>
      </Text>

      <Section className="mt-4 rounded-md bg-slate-100 p-4">
        <Text>
          <strong className="text-slate-700">Votre message :</strong>
        </Text>
        <Text className="whitespace-pre-wrap text-slate-700">
          {originalMessage}
        </Text>
      </Section>

      <Section className="mt-4 rounded-md bg-blue-50 p-4">
        <Text>
          <strong className="text-blue-800">Notre réponse :</strong>
        </Text>
        <Text className="whitespace-pre-wrap text-slate-800">
          {adminResponse}
        </Text>
      </Section>

      <Text className="mt-4">
        Si vous avez d'autres questions, n'hésitez pas à nous contacter à
        nouveau via la page de support.
      </Text>

      <Text>Merci de votre confiance,</Text>
      <Text>L'équipe Co-Sport</Text>
    </EmailLayout>
  );
};

export default SupportResponseEmail;
