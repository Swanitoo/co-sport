import { auth } from "@/auth/auth";
import { currentUser, requiredCurrentUser } from "@/auth/current-user";

// Exporter les fonctions d'authentification
export { auth, currentUser, requiredCurrentUser };

// Pour rétrocompatibilité avec les routes qui utilisent getServerSession(authOptions)
export const authOptions = {};
