import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";
import { useState } from "react";

export const SocialSelector = () => {
    const [url, setUrl] = useState("");

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <Input className="bg-background/50" />
                <Button>
                    <Check size={16} />
                </Button>
            </div>
            <p className="text-sm font-light text-muted-foreground">
                Add a link to your Instagram or you FaceBook
            </p>
        </div>
    )
}