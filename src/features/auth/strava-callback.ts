import axios from "axios";
import { getSession } from "next-auth/react";
import prisma from "@/lib/prisma"; // Exemple pour connecter à ta base

export default async function handler(req, res) {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).json({ error: "Invalid request" });
  }

  // Récupérer les infos de session
  const session = await getSession({ req });

  if (!session || session.user.id !== state) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const clientId = process.env.AUTH_STRAVA_ID;
  const clientSecret = process.env.AUTH_STRAVA_SECRET;

  try {
    // Échange le code contre un token d'accès
    const response = await axios.post("https://www.strava.com/oauth/token", {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
    });

    const { access_token, athlete } = response.data;

    // Lier le compte Strava à l'utilisateur
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        stravaId: athlete.id,
        stravaAccessToken: access_token,
      },
    });

    res.redirect("/dashboard?linked=strava");
  } catch (error) {
    console.error("Strava linking error:", error);
    res.status(500).json({ error: "Failed to link Strava account" });
  }
}
