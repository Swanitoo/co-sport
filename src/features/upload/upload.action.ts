"use server";

import { ActionError, userAction } from "@/safe-actions";
import { z } from "zod";
import { put } from "@vercel/blob"

export const uploadImageAction = userAction(
    z.instanceof(FormData),
    async (formData: FormData) => {
        const file = formData.get("file") as File;
    
        if (!file) {
            throw new ActionError("File not found");
        }

        const name = file.name;

        const result = await put(name, file, {
            access: "public",
        });

        return result;
    }
);