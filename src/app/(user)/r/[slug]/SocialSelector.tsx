import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const SocialSelector = ({
  onSelect,
}: {
  onSelect: (name: string, url: string) => void;
}) => {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");

  const onSubmit = () => {
    if (!url) {
      toast.error("Please enter a valid URL");
      return;
    }

    if (!name) {
      toast.error("Please enter a name");
      return;
    }

    if (
      !url.match(
        /https?:\/\/(www\.)?(instagram\.com\/[a-zA-Z0-9._-]+\/?|facebook\.com\/[a-zA-Z0-9.]+\/?)$/,
      )
    ) {
      toast.error("Please enter a valid instagram or facebook/instagram URL");
      return;
    }

    onSelect(name, url);
  };

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
        <Button onClick={onSubmit} className="w-full">
          <Check size={16} />
        </Button>
      </div>
      <p className="text-sm font-light text-muted-foreground">
        Add a link to your Instagram or you FaceBook
      </p>
    </div>
  );
};
