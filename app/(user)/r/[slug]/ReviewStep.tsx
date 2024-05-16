"use client"

import { Product } from "@prisma/client";
import { useState } from "react";

export const ReviewStep = ({ product } : { product: Product }) => {
    const [step, setStep] = useState(0);

    if (step === 0) {
        return (
            <div className="flex h-full flex-col items-center justify-center">
                <h2 className="text-lg font-bold">
                    {product.noteText ?? `How much did you like ${product.name}?`}
                </h2>
            </div>
        )
    }
}