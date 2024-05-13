import Image from "next/image";
import { LoggedInButton } from "../auth/LoggedInButton";
import { Layout } from "@/components/layout";
import { ModeToggle } from "../theme/ModeToggle";

export const Header = async () => {
    return (
        <header className="w-full border-b border-border py-1">
            <Layout className="flex items-center flex-row gap-4 py-0">
                <div className="flex-1">
                    <Image src="/icon.png" 
                        width={42} 
                        height={42} 
                        alt="co-sport logo" />
                </div>
                <div className="flex items-center gap-2">
                    <ModeToggle />
                    <LoggedInButton />
                </div>
            </Layout>
        </header>
    );
};