import { Text } from "@react-email/components";
import EmailLayout from "./EmailLayout";

interface PartnershipRequestEmailProps {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  description: string;
}

export const PartnershipRequestEmail = ({
  companyName,
  contactName,
  email,
  phone,
  description,
}: PartnershipRequestEmailProps) => {
  return (
    <EmailLayout preview="Nouvelle demande de partenariat">
      <Text className="text-xl font-bold text-slate-900">
        Nouvelle demande de partenariat
      </Text>
      <Text className="mt-4 text-base text-slate-700">
        Vous avez reçu une nouvelle demande de partenariat de la part de{" "}
        <strong>{companyName}</strong>.
      </Text>

      <Text className="mt-4 text-base font-semibold text-slate-800">
        Détails du partenaire:
      </Text>
      <Text className="text-base text-slate-700">
        <strong>Entreprise:</strong> {companyName}
      </Text>
      <Text className="text-base text-slate-700">
        <strong>Contact:</strong> {contactName}
      </Text>
      <Text className="text-base text-slate-700">
        <strong>Email:</strong> {email}
      </Text>
      <Text className="text-base text-slate-700">
        <strong>Téléphone:</strong> {phone || "Non fourni"}
      </Text>

      <Text className="mt-4 text-base font-semibold text-slate-800">
        Description du partenariat:
      </Text>
      <Text className="whitespace-pre-line text-base text-slate-700">
        {description}
      </Text>

      <Text className="mt-6 text-sm text-slate-500">
        Cette demande a été soumise depuis la page partenariat de Co-Sport.
      </Text>
    </EmailLayout>
  );
};

export default PartnershipRequestEmail;
