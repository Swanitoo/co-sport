import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export type ReviewTextSelectorProps = {};

export const ReviewTextSelector = (props: ReviewTextSelectorProps) => {
    return (
        <div className="grid w-full gap-2">
          <Textarea placeholder="Type your message here." />
          <Button>Send message</Button>
        </div>
      )
}