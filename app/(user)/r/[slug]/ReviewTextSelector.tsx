import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from "@/components/ui/tabs"

export type ReviewTextSelectorProps = {};

export const ReviewTextSelector = (props: ReviewTextSelectorProps) => {
    return (
        <Tabs>
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text">Text</TabsTrigger>
            </TabsList>
        </Tabs>
    )
}