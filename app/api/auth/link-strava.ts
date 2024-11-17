import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  try {
    console.log("Request method:", req.method);

    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method Not Allowed" });
    }

    // Log les détails de la requête pour aider à diagnostiquer
    const session = await getSession({ req });
    console.log("Session:", session);

    if (!session) {
      console.error("No session found");
      return res.status(401).json({ message: "Non autorisé" });
    }

    // Simule une réponse correcte pour le test
    return res
      .status(200)
      .json({ redirectUrl: "https://www.strava.com/oauth/authorize" });
  } catch (error) {
    console.error("Error in handler:", error);
    res.status(500).json({ error: error.message });
  }
}
