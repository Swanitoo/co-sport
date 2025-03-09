import { currentUser } from "@/auth/current-user";
import Home from "./home/page";

export default async function Index() {
  const user = await currentUser();

  // Ne pas rediriger les utilisateurs connectés - ils peuvent voir la page d'accueil
  // Les utilisateurs pourront toujours naviguer vers le dashboard via le menu

  return <Home />;
}
