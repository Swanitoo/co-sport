import { Section } from "./Section";

export const ProblemsSection = () => {
  return (
    <Section>
      <h2 className="text-center text-3xl font-bold">
      Se surpasser + Sociabiliser 
      </h2>
      <div className="m-auto mt-4 flex max-w-3xl gap-4 max-lg:flex-col">
        <div className="flex flex-1 flex-col items-start rounded-lg bg-red-500/50 p-4 shadow lg:p-8">
          <h3 className="text-xl font-bold">Free plan</h3>
          <ul className="flex list-disc flex-col items-start text-left ml-5">
            <li>Créer une séance par mois</li>
            <li>Nombre de réservation limité</li>
          </ul>
        </div>
        <div className="flex flex-1 flex-col items-start rounded-lg bg-green-500/50 p-4 shadow lg:p-8">
          <h3 className="text-xl font-bold">Premium</h3>
          <ul className="flex list-disc flex-col items-start text-left ml-5">
            <li>Créer des séances ilimité</li>
            <li>Réservation illimitée</li>
          </ul>
        </div>
      </div>
    </Section>
  );
};