"use client"

import { Product } from "@prisma/client";
import { useState } from "react";
import ReviewSelector from "./ReviewSelector";

type Data = {
    review: null | number;
}

export const ReviewStep = ({ product } : { product: Product }) => {
    const [step, setStep] = useState(0);
    const [data, setData] = useState<Data>({
        review: null,
    });

    const updateData = (partial: Partial<Data>) => {
        setData((prev) => ({
            ...prev,
            ...partial,
        }));
    };

    if (step === 0) {
        return (
            <div className="flex h-full flex-col items-center justify-center">
                <h2 className="text-lg font-bold">
                    {product.noteText ?? `How much did you like ${product.name}?`}
                </h2>
                <ReviewSelector 
                    onSelect={(review) => {
                        setStep(1);
                        setData({ review });
                }}
            />
            </div>
        )
    }
}