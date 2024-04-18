import { signIn } from "@/auth/auth";
import { Button } from "@/components/ui/button";

export const SignInButton = () => {
    return (
        <form>
            <Button
            variant="secondary"
            size="sm"
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