import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import type { Adapter, AdapterAccount, AdapterUser } from "next-auth/adapters";

// Type étendu pour les utilisateurs avec les champs spécifiques de Strava
type ExtendedUserData = AdapterUser & {
  stravaId?: string;
  stravaConnected?: boolean;
  sex?: string;
  city?: string;
  state?: string;
  country?: string;
  stravaPremium?: boolean;
  stravaWeight?: number;
  stravaCreatedAt?: Date;
  [key: string]: any; // Pour d'autres propriétés dynamiques
};

/**
 * Adapte l'adaptateur Prisma pour résoudre le problème de type avec les IDs numériques de Strava.
 * Assure que tous les identifiants sont bien convertis en chaînes avant d'être utilisés avec la base de données.
 */
export function CustomPrismaAdapter(prisma: PrismaClient): Adapter {
  // Récupérer l'adaptateur Prisma standard
  const standardAdapter = PrismaAdapter(prisma);

  // Étendre l'adaptateur avec notre propre implémentation
  return {
    ...standardAdapter,
    getUserByAccount: async (account) => {
      const { providerAccountId, provider } = account;

      // S'assurer que providerAccountId est toujours une chaîne
      const providerAccountIdStr = providerAccountId
        ? providerAccountId.toString()
        : "";

      // Rechercher le compte avec l'ID converti en chaîne
      const dbAccount = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId: providerAccountIdStr,
          },
        },
        select: { user: true },
      });

      // Adapter le résultat à AdapterUser
      if (!dbAccount?.user) return null;

      // Extraire les champs requis par AdapterUser
      const { id, name, email, emailVerified, image } = dbAccount.user;

      // Construire un objet compatible avec AdapterUser
      const adapterUser: AdapterUser = {
        id,
        name,
        email: email || "",
        emailVerified,
        image,
      };

      return adapterUser;
    },

    // Surcharger createUser pour s'assurer que tous les champs supplémentaires sont correctement sauvegardés
    // et pour gérer les cas de contraintes uniques (stravaId)
    createUser: async (userData: ExtendedUserData): Promise<AdapterUser> => {
      // Vérifier que la méthode existe dans l'adaptateur standard
      if (typeof standardAdapter.createUser !== "function") {
        throw new Error(
          "createUser method not implemented in standard adapter"
        );
      }

      try {
        // Si l'utilisateur a un stravaId, vérifier s'il existe déjà
        if (userData.stravaId) {
          const existingUser = await prisma.user.findUnique({
            where: { stravaId: userData.stravaId.toString() },
          });

          // Si l'utilisateur existe déjà, mettre à jour ses informations plutôt que d'en créer un nouveau
          if (existingUser) {
            console.log("Utilisateur Strava existant trouvé, mise à jour...");
            const updatedUser = await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                name: userData.name || existingUser.name,
                image: userData.image || existingUser.image,
                stravaConnected: true,
                sex: userData.sex || existingUser.sex,
                city: userData.city || existingUser.city,
                state: userData.state || existingUser.state,
                country: userData.country || existingUser.country,
                stravaPremium: userData.stravaPremium,
                stravaWeight: userData.stravaWeight,
                stravaCreatedAt: userData.stravaCreatedAt,
              },
            });

            // Convertir en format AdapterUser
            return {
              id: updatedUser.id,
              name: updatedUser.name,
              email: updatedUser.email || "",
              emailVerified: updatedUser.emailVerified,
              image: updatedUser.image,
            };
          }
        }

        // Si aucun utilisateur existant n'a été trouvé, créer un nouvel utilisateur
        console.log("Création d'un nouvel utilisateur");
        // Suppression du await car le résultat est déjà une Promise
        return standardAdapter.createUser(userData);
      } catch (error) {
        console.error(
          "Erreur lors de la création/mise à jour de l'utilisateur:",
          error
        );
        throw error;
      }
    },

    // Surcharger linkAccount pour s'assurer que providerAccountId est une chaîne
    linkAccount: async (
      rawAccount: AdapterAccount
    ): Promise<AdapterAccount | null> => {
      try {
        // S'assurer que providerAccountId est toujours une chaîne
        const providerAccountId = rawAccount.providerAccountId
          ? rawAccount.providerAccountId.toString()
          : "";

        // Extraire uniquement les champs supportés par le schéma Prisma
        const validAccountFields = {
          userId: rawAccount.userId,
          provider: rawAccount.provider,
          providerAccountId,
          type: rawAccount.type,
          refresh_token: rawAccount.refresh_token,
          access_token: rawAccount.access_token,
          expires_at: rawAccount.expires_at
            ? typeof rawAccount.expires_at === "number"
              ? rawAccount.expires_at
              : parseInt(String(rawAccount.expires_at), 10)
            : null,
          token_type: rawAccount.token_type,
          scope: rawAccount.scope,
          id_token: rawAccount.id_token,
          session_state: rawAccount.session_state,
        };

        // Supprimer les propriétés undefined ou null pour éviter les erreurs Prisma
        const account = Object.fromEntries(
          Object.entries(validAccountFields).filter(
            ([_, v]) => v !== undefined && v !== null
          )
        ) as AdapterAccount;

        // Vérifier si un compte existe déjà pour cet utilisateur et ce provider
        const existingAccount = await prisma.account.findFirst({
          where: {
            userId: account.userId,
            provider: account.provider,
          },
        });

        if (existingAccount) {
          console.log("Compte existant trouvé, mise à jour...");
          // Mettre à jour les informations du compte existant
          const updatedAccount = await prisma.account.update({
            where: { id: existingAccount.id },
            data: {
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              scope: account.scope,
              id_token: account.id_token,
              token_type: account.token_type,
              expires_at: account.expires_at,
            },
          });
          return updatedAccount as AdapterAccount;
        } else if (standardAdapter.linkAccount) {
          // Créer un nouveau compte via l'adaptateur standard
          const newAccount = await prisma.account.create({
            data: account as any,
          });
          return newAccount as AdapterAccount;
        }

        return null;
      } catch (error) {
        console.error("Erreur lors de la liaison du compte:", error);
        return null;
      }
    },
  };
}
