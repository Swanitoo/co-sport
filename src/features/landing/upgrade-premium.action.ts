import { userAction } from "@/safe-actions";
import { z } from "zod";

export const upgradeToPremium = userAction(z.string(), async (_ , context) => {

})