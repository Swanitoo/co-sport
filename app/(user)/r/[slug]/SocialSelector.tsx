import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";
import { useState } from "react";

export const SocialSelector = () => {
    const [url, setUrl] = useState("");
    const [name, setName] = useState("");

    const onSubmit = () => {
        
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-col items-center gap-2">
                <Input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background/50" 
                    placeholder="Name"
                />
                <Input 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="bg-background/50" 
                    placeholder="https://www.instagram.com/yourinstagram/"
                />
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