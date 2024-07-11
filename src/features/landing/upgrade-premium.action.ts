"use server";

import { env } from "@/env";
import { ActionError, userAction } from "@/safe-actions";
import { stripe } from "@/stripe";
import { redirect } from "next/navigation";
import { z } from "zod";

export const upgradeToPremium = userAction(z.string(), async (_ , context) => {
    if (context.user.plan === "PREMIUM") {
        throw new ActionError("User is already on premium plan");
      }
    
      const stripeCustomerId = context.user.stripeCustomerId;
    
      if (!stripeCustomerId) {
        throw new ActionError("User does not have a stripe customer id");
      }
    const stripeCheckout = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ["card", "link"],
        mode: "subscription",
        line_items: [
          {
            price:
              env.NODE_ENV === "development"
                ? "price_1Pb5szAm3RaoXc2D0JSzw1yS"
                : "price_1Pb5szAm3RaoXc2D0JSzw1yS",
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXTAUTH.URL}/success`,
        cancel_url: `${process.env.NEXTAUTH.URL}/cancel`,
      });

      if (!stripeCheckout.url) {
        throw new ActionError("Stripe checkout url is missing");
      }
    
      redirect(stripeCheckout.url);
    });