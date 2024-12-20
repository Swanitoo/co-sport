"use client"

import { Product, Review } from "@prisma/client";
import { useState } from "react";
import ReviewSelector from "./RatingSelector";
import { motion, AnimatePresence } from "framer-motion";
import { SocialSelector } from "./SocialSelector";
import { ReviewTextSelector } from "./ReviewTextSelector";
import { useLocalStorage } from "react-use";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getReviewAction, updateReviewAction } from "./reviews.action";
import { ReviewType } from "./review.schema";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";


const getCurrentStep = (data?: Review) => {
    if (!data) return 0;

    if (data.rating === undefined) {
        return 0;
    }

    if (!data.name || !data.socialLink) {
        return 1;
    }

    if (!data.text) {
        return 2;
    }

    return 3
};

export const ProcessReviewStep = ({ product } : { product: Product }) => {
    const [reviewId, setReviewId, removeReviewId] = useLocalStorage <null | string>(
        `review-id-${product.id}`, 
        null
    );

    const queryClient = useQueryClient();
    const reviewData = useQuery({
        queryKey: ["review", reviewId, "product", product.id],
        enabled: Boolean(reviewId),
        queryFn: async () => 
            {
                const {data, serverError} = await getReviewAction({
                    id: reviewId ?? "",
                    productId: product.id,
                });

                if (serverError || !data) {
                    toast.error(serverError);
                    return;
                }

                return data;
            },
    });

    const mutateReview = useMutation({
        mutationFn: async (data: Partial<ReviewType>) => {
            const {data: actionData, serverError} = await updateReviewAction({
                ...data,
                productId: product.id,
                id: reviewId ?? undefined,
            });

            if (!actionData || serverError) {
                toast.error(serverError || "Failled to save review")

                return;
            }

            setReviewId(actionData.id);
            await queryClient.invalidateQueries({
                queryKey: ["review", actionData.id, "product", product.id],
            });
        },
    });

    const updateData = (partial: Partial<ReviewType>) => {
        mutateReview.mutate(partial);
    };

    const step = getCurrentStep(reviewData.data);

        return (
            <div className={cn("h-full", {
                "animate-pulse" : mutateReview.isPending,
            })}
            >
                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <motion.div
                        key="step-0"
                            exit={{
                                opacity: 0,
                                x: -100,
                            }}
                            className="flex h-full flex-col items-center justify-center"
                        >
                            <h2 className="text-lg font-bold">
                                {`Quelle note attribues-tu à ${product.name}?`}
                            </h2>
                            <ReviewSelector 
                                onSelect={(review) => {
                                    updateData({ 
                                        rating: review,
                                    });
                                }}
                            />
                        </motion.div>
                    )}
                    {step === 1 && (
                        <motion.div
                            key="step-2"
                            exit={{
                                opacity: 0,
                                x: -100,
                            }}
                            initial={{
                                opacity: 0,
                                x: 100,
                            }}
                            animate={{
                                opacity: 1,
                                x: 0,
                            }}
                                className="flex h-full flex-col items-center justify-center gap-4"
                            >
                            <h2 className="text-lg font-bold">
                                {`Dis-moi ce que tu as aimé et ce que tu n'as pas aimé`}
                            </h2>
                            <ReviewTextSelector 
                                onInputSend={(i) =>{
                                    updateData({
                                        text: i,
                                    });
                                }} 
                                productId={product.id} 
                            />
                        </motion.div>
                    )}
                    {step === 3 && (
                        <motion.div
                            key="step-3"
                            exit={{
                                opacity: 0,
                                x: -100,
                            }}
                            initial={{
                                opacity: 0,
                                x: 100,
                            }}
                            animate={{
                                opacity: 1,
                                x: 0,
                            }}
                                className="flex h-full flex-col items-center justify-center gap-4 max-w-lg"
                            >
                            <h2 className="text-lg font-bold">
                                {`Merci pour ton commentaire!`}
                            </h2>
                            <Card>
                                <CardHeader>
                                    <CardDescription>
                                        <p>Ton commentaire: {reviewData.data?.text}</p>
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
}