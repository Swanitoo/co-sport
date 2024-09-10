"use client";

import { useEffect, useState } from "react";

// Définir les types pour les données d'athlète et d'activité
interface Athlete {
  id: number;
  firstname: string;
  lastname: string;
  city?: string; // La ville peut être optionnelle
}

interface Activity {
  id: number;
  name: string;
  type: string;
  distance: number;
  start_date: string;
}

const Activities = () => {
  const [athlete, setAthlete] = useState<Athlete | null>(null); // Typage de l'athlète
  const [activities, setActivities] = useState<Activity[]>([]); // Typage des activités
  const [loading, setLoading] = useState(true);

  // Fonction pour récupérer le token Strava, retourne soit un token (string) soit null en cas d'erreur
  const fetchStravaToken = async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/webhooks/strava', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Token data:', data);
      return data.access_token; // Le jeton est une chaîne de caractères
    } catch (error) {
      console.error('Erreur lors de la récupération du token Strava:', error);
      return null; // Retourner null en cas d'erreur
    }
  };

  // Fonction pour récupérer les informations de l'athlète
  const fetchAthleteInfo = async (accessToken: string): Promise<void> => { // Typage du paramètre accessToken
    try {
      const response = await fetch(`https://www.strava.com/api/v3/athlete?access_token=${accessToken}`);
      const data: Athlete = await response.json(); // Typage des données d'athlète
      console.log('Athlete info:', data);
      setAthlete(data); // Stocker les informations de l'athlète
    } catch (error) {
      console.error('Erreur lors de la récupération des informations de l\'athlète:', error);
    }
  };

  // Fonction pour récupérer les activités via le token Strava
  const fetchActivities = async (accessToken: string): Promise<void> => { // Typage du paramètre accessToken
    try {
      const response = await fetch(`https://www.strava.com/api/v3/athlete/activities?access_token=${accessToken}`);
      const data: Activity[] = await response.json(); // Typage des données d'activités
      console.log('Activités Strava:', data);
      setActivities(data); // Stocker les activités
    } catch (error) {
      console.error('Erreur lors de la récupération des activités:', error);
    }
  };

  // Fonction principale pour gérer l'ensemble des appels
  const fetchData = async () => {
    const accessToken = await fetchStravaToken(); // Obtenir le token
    if (!accessToken) return;

    await fetchAthleteInfo(accessToken); // Utiliser le token pour obtenir les infos de l'athlète
    await fetchActivities(accessToken);  // Utiliser le token pour obtenir les activités
    setLoading(false); // Terminer le chargement
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <p>Chargement des informations Strava...</p>;

  return (
    <div>
      <h1>Mes informations Strava</h1>
      {athlete ? (
        <div>
          <p>
            <strong>{athlete.firstname} {athlete.lastname}</strong>
          </p>
          <p>Ville : {athlete.city || 'Non spécifiée'}</p>
        </div>
      ) : (
        <p>Aucune information d'athlète disponible.</p>
      )}

      <h2>Mes activités</h2>
      <ul>
        {activities.map((activity) => (
          <li key={activity.id}>
            <strong>{activity.name}</strong> ({activity.type}) - {activity.distance}m - {new Date(activity.start_date).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Activities;
