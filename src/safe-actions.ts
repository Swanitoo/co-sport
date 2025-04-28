import { createSafeActionClient } from "next-safe-action";
import { currentUser } from "./auth/current-user";

// Définir le type approprié pour createSafeActionClient avec middleware
type ActionClientOpts = {
  handleServerError: (error: Error) => string;
  middleware?: () => Promise<any>;
};

export class ActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActionError";
  }
}

const handleServerError = (error: Error) => {
  if (error instanceof ActionError) {
    return error.message;
  }
  return "An unexpected error occurred";
};

export const action = createSafeActionClient({
  handleServerError,
} as ActionClientOpts);

export const userAction = createSafeActionClient({
  handleServerError,
  middleware: async () => {
    const user = await currentUser();

    if (!user) {
      throw new ActionError("You must be logged in");
    }

    return { user };
  },
} as ActionClientOpts);
