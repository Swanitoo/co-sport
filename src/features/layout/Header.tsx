import { currentUser } from "@/auth/current-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LoggedInDropdown } from "@/features/auth/LoggedInDropdown";
import { ModeToggle } from "@/features/theme/ModeToggle";
import { prisma } from "@/prisma";
import Image from "next/image";
import Link from "next/link";

export async function Header() {
  const user = await currentUser();

  let pendingRequestsCount = 0;
  if (user) {
    const pendingRequests = await prisma.membership.count({
      where: {
        product: {
          userId: user.id
        },
        status: "PENDING"
      }
    });
    pendingRequestsCount = pendingRequests;
  }

  return (
    <header className="w-full border-b border-border py-1">
      <div className="max-w-5xl w-full mx-auto px-4 flex items-center flex-row gap-4 py-0">
        <div className="flex-1">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Image src="/icon.png" alt="Logo" width={32} height={32} />
          </Link>
        </div>

        <div className="flex items-center justify-end space-x-2">
          <ModeToggle />
          {user ? (
            <LoggedInDropdown userId={user.id} pendingRequestsCount={pendingRequestsCount}>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.image || undefined} alt={user.name || ""} />
                  <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                </Avatar>
              </Button>
            </LoggedInDropdown>
          ) : (
            <Link href="/auth/signin">
              <Button>Connexion</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}