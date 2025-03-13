import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    isAdmin?: boolean;
    sex?: string;
    stravaConnected?: boolean;
    stravaId?: string;
  }

  /**
   * Retourne par la fonction `useSession`, `getSession` et reçu en tant que prop `session` dans `SessionProvider`.
   */
  interface Session {
    user: {
      id: string;
      isAdmin?: boolean;
      sex?: string;
      stravaConnected?: boolean;
      stravaLinkRefused?: boolean;
      stravaId?: string;
    } & DefaultSession["user"];
  }

  /**
   * Le payload JWT.
   */
  interface JWT {
    id?: string;
    isAdmin?: boolean;
    sex?: string;
    stravaConnected?: boolean;
    stravaId?: string;
  }
}

// Étendre les types AdapterUser pour inclure les champs personnalisés
declare module "next-auth/adapters" {
  interface AdapterUser {
    stravaConnected?: boolean;
    stravaId?: string;
    sex?: string | null;
    isAdmin?: boolean;
  }
}
