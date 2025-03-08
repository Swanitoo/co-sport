import { Button } from "./Button";
import EmailLayout from "./EmailLayout";
import { Text } from "./Text";

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const ProductCreatedEmail = ({
  productName,
  productId,
  isFirstProduct = false,
  slug,
}: {
  productName: string;
  productId: string;
  isFirstProduct?: boolean;
  slug?: string;
}) => {
  return (
    <EmailLayout
      preview={
        isFirstProduct
          ? "Votre première annonce a été créée !"
          : "Votre annonce a été créée !"
      }
    >
      <Text className="text-base font-light leading-8 text-gray-800">
        {isFirstProduct
          ? "Félicitations ! Vous venez de créer votre première annonce sur co-sport.com."
          : `Votre annonce "${productName}" a été créée avec succès !`}
      </Text>
      <Text className="text-base font-light leading-8 text-gray-800">
        Vous pouvez maintenant : - Partager votre annonce - Gérer les demandes
        d'adhésion - Communiquer avec les membres
      </Text>
      <Button
        className="block w-52 rounded bg-blue-600 py-3.5 text-center text-sm font-normal text-white no-underline"
        href={`${baseUrl}/products/${productId}`}
      >
        Voir mon annonce
      </Button>

      {isFirstProduct && slug && (
        <>
          <Text className="text-base font-light leading-8 text-gray-800">
            Vous pouvez partager le lien pour les avis :
          </Text>
          <Button
            className="block w-52 rounded bg-blue-600 py-3.5 text-center text-sm font-normal text-white no-underline"
            href={`${baseUrl}/r/${slug}`}
          >
            Partager le lien des avis
          </Button>
        </>
      )}

      <Text className="text-base font-light leading-8 text-gray-800">
        Bonne activité sportive !
      </Text>
      <Text className="text-base font-light leading-8 text-gray-800">
        L'équipe Co-Sport
      </Text>
    </EmailLayout>
  );
};

export default ProductCreatedEmail;
