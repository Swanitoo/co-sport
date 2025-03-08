import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useSession } from "next-auth/react";
import { LoggedInDropdown } from "./LoggedInDropdown";

interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  plan?: "FREE" | "PREMIUM";
}

export const LoggedInButton = () => {
  const { data: session } = useSession();
  const user = session?.user as ExtendedUser | undefined;

  if (!user?.id) {
    return null;
  }

  return (
    <LoggedInDropdown
      userId={user.id}
      user={{
        name: user.name,
        email: user.email,
        image: user.image,
      }}
    >
      <Button variant="outline" size="sm">
        {user.plan === "PREMIUM" ? <Star size={14} className="mr-2" /> : null}
        <Avatar className="size-6">
          <AvatarImage src={user.image || undefined} />
          <AvatarFallback>{user.name?.[0]}</AvatarFallback>
        </Avatar>
      </Button>
    </LoggedInDropdown>
  );
};
