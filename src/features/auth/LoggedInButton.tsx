import { baseAuth } from "@/auth/auth"
import { SignInButton } from "./SignInButton"
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoggedInDropDown } from "./LoggedInDropdown";

export const LoggedInButton = async () => {
    const session = await baseAuth();

    if (!session?.user) {
        return <SignInButton />
    }

    return (
        <LoggedInDropDown>
            <Button variant="outline" size="sm">
                <Avatar className="size-6">
                    <AvatarFallback>{session.user.name?.[0]}</AvatarFallback>
                    {session.user.image ? (
                        <AvatarImage
                        src={session.user.image}
                        alt={`${session.user.name ?? "-"}'s profile picture`} 
                        />
                    ): null}
                </Avatar>
            </Button>
        </LoggedInDropDown>
    );
};