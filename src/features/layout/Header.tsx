import Image from "next/image";
import { LoggedInButton } from "../auth/LoggedInButton";
import { Layout } from "@/components/layout";

export const Header = async () => {
    return (
        <header className="w-full border-b border-border py-1">
            <Layout className="flex items-center gap-4">
                <div className="flex-1">
                    <Image src="/icon.png" 
                        width={42} 
                        height={42} 
                        alt="co-sport logo" />
                </div>
                <div>
                    <LoggedInButton />
                </div>
            </Layout>
        </header>
    );
};