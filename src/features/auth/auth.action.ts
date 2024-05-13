"use server";

import { signOut, signIn } from "@/auth/auth";

export const signOutAction = async () => {
    await signOut();
}

export const signInAction = async () => {
    await signIn();
}