/**
 * Extrait le premier prénom d'un nom complet
 * @param fullName Nom complet de l'utilisateur
 * @returns Le premier prénom ou "Utilisateur" si le nom est null
 */
export const getFirstName = (fullName: string | null): string => {
  if (!fullName) return "Utilisateur";
  return fullName.split(" ")[0];
};
