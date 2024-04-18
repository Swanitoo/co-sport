import { signIn } from "@/auth/auth";
import { Button } from "@/components/ui/button";

export const SignInButton = () => {
    return (
        <form>
            <Button
                formAction={async () => {
                    "use server";
                    await signIn();
                }}
            >
                Sign In
            </Button>
        </form>
    );
};