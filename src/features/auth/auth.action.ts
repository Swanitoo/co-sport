"use server";

import { signIn, signOut } from "@/auth/auth";
import { getServerUrl } from "@/get-server-url";
import { ActionError, userAction } from "@/safe-actions";
import { stripe } from "@/stripe";
import { z } from "zod";

export const singOutAction = async () => {
  await signOut();
};

export const signInAction = async () => {
  await signIn();
};

export const setupCustomerPortal = userAction(
  z.string(),
  async (_, context) => {
    const stripeCustomerId = context.user.stripeCustomerId;

    if (!stripeCustomerId) {
      throw new ActionError("User does not have a stripe customer id");
    }

    const stripeSettingsLink = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${getServerUrl()}/dashboard`,
    });

    if (!stripeSettingsLink.url) {
      throw new ActionError("Failed to create stripe settings link");
    }

    return stripeSettingsLink.url;
  }
);

export const connectStravaAction = async () => {
  console.log("Fetching URL:", `${getServerUrl()}/api/auth/link-strava`);
  try {
    // Appelle l'API pour démarrer le processus de liaison
    const response = await fetch(`${getServerUrl()}/api/auth/link-strava`, {
      method: "POST",
      credentials: "include",
    });
    console.log("Fetching URL:", `${getServerUrl()}/api/auth/link-strava`);
    console.log("Response status:", response.status);
    console.log("Response body:", await response.text());

    if (!response.ok) {
      throw new ActionError("Failed to initiate Strava linking process");
    }

    const { redirectUrl } = await response.json();

    // Redirige l'utilisateur vers Strava pour autorisation
    window.location.href = redirectUrl;
  } catch (error) {
    console.error(error);
    throw new ActionError("Failed to connect Strava account");
  }
};
