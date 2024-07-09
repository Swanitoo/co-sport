import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react";

export type ReviewTextSelectorProps = {
    productId: string;
    onInputSend: (input: string) => void;
};

export const ReviewTextSelector = (props: ReviewTextSelectorProps) => {
    return (
        <div className="grid w-full gap-2">
            <InputControl onInputSend={props.onInputSend} />
        </div>
      )
}

const InputControl = ({
    onInputSend
}: {
    onInputSend: (input: string) => void;
}) => {
    const [input, setInput] = useState("");
    return (
        <div className="flex flex-col gap-2">
            <Textarea
                placeholder="Write your review here"
                className="w-full bg-accent/50"
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
            <Button variant="default" size="sm" onClick={() => {
                onInputSend(input);
            }}>
                Submit
            </Button>
        </div>
    )
}