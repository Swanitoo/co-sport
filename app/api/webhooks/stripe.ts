import { env } from "@/env";
import { stripe } from "@/stripe";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const POST = async (req: NextRequest) => {
    const body = await req.json();

    const stripeSignature = req.headers.get("stripe-signature");

    if (!stripeSignature)  {
        return NextResponse.json({ error: "No stripe signature" }, { status: 400});
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            stripeSignature,
            env.STRIPE_WEBHOOK_SECRET,
        );
    } catch (err) {
        return NextResponse.json({ error: "Invalid stripe signature" }, { status: 400});
    }
};