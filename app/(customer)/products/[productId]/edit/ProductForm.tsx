"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card"

export type ProductFormProps = {

}

export const ProductForm = (props: ProductFormProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    Create product
                </CardTitle>
            </CardHeader>
        </Card>
    )
}