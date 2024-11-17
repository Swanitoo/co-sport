import { getSession } from "next-auth/react";
import axios from "axios";

export default async function handler(req, res) {
  try {
    console.log("Request method:", req.method);

    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method Not Allowed" });
    }

    const session = await getSession({ req });
    console.log("Session:", session);

    if (!session) {
      console.error("No session found");
      return res.status(401).json({ message: "Non autorisé" });
    }

    const stravaClientId = process.env.AUTH_STRAVA_ID;
    const stravaClientSecret = process.env.AUTH_STRAVA_SECRET;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback/strava`;

    const authorizationUrl = `https://www.strava.com/oauth/authorize?client_id=${stravaClientId}&response_type=code&redirect_uri=${redirectUri}&scope=read,activity:read_all&state=${session.user.id}`;

    return res.status(200).json({ redirectUrl: authorizationUrl });
  } catch (error) {
    console.error("Error in handler:", error);
    res.status(500).json({ error: error.message });
  }
}
