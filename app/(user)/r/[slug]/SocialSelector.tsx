import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";
import { useState } from "react";

export const SocialSelector = () => {
    const [url, setUrl] = useState("");

    return (
        <div className="flex items-center gap-2">
            <Input />
            <Button>
                <Check size={16} />
            </Button>
        </div>
    )
}