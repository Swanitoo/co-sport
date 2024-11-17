import { getSession } from "next-auth/react";
import axios from "axios";
import { prisma } from "@/prisma";

export default async function handler(req, res) {
  try {
    const { code, state } = req.query;

    const stravaClientId = process.env.AUTH_STRAVA_ID;
    const stravaClientSecret = process.env.AUTH_STRAVA_SECRET;

    const response = await axios.post("https://www.strava.com/oauth/token", {
      client_id: stravaClientId,
      client_secret: stravaClientSecret,
      code: code,
      grant_type: "authorization_code",
    });

    const { access_token, refresh_token } = response.data;

    // Store tokens in the database
    await prisma.user.update({
      where: { id: state },
      data: {
        stravaAccessToken: access_token,
        stravaRefreshToken: refresh_token,
      },
    });

    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error in callback handler:", error);
    res.status(500).json({ error: error.message });
  }
}
