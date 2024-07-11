import { userAction } from "@/safe-actions";
import { z } from "zod";

export const upgradeToPremium = userAction(z.string(), async (_ , context) => {
    z.string(),
    async (_, context) => {
        const stripeCustomerId = context.user.stripeCustomerId;

        if (!stripeCustomerId){
            throw new Error("User does not have a stripe customer Id");
        }
    }
})