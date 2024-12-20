import { currentUser } from "@/auth/current-user";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import Link from "next/link";
import { PropsWithChildren } from "react";
import { upgradeToPremium } from "./upgrade-premium.action";

export const PricingSection = async () => {
  const user = await currentUser();

  return (
    <section id="pricing">
      <div className="mx-auto mb-8 max-w-screen-md text-center lg:mb-12">
        <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          2 Abonnnements au choix
        </h2>
        <p className="mb-5 font-light text-gray-500 dark:text-gray-400 sm:text-xl">
          Un accès gratuit dans un premier temps
        </p>
      </div>
      <div className="flex justify-center items-center gap-4 max-lg:flex-col">
        <PricingCard
          title="Gratuit"
          price={0}
          description="Pour un essais"
          items={["Créer une annonce", "Rejoins 3 annonces"]}
        >
          <Link
            href="/api/auth/signin"
            className={cn(
              buttonVariants({
                size: "lg",
                variant: "outline",
              }),
              "w-full"
            )}
          >
            Inscription
          </Link>
        </PricingCard>
        <PricingCard
          title="Premium"
          price={15}
          description="Pour une utilisation sans fin et sans pub"
          items={[
            "Créer un nombre d'annonces ilimité",
            "Participe a un nombre d'annonces ilimité",
            "Pas de publicité"
          ]}
        >
          {user ? (
            <form className="w-full">
              <Button
                formAction={async () => {
                  "use server";
                  await upgradeToPremium("");
                }}
                size="lg"
                variant="default"
                className="w-full"
              >
                Abonnement
              </Button>
            </form>
          ) : (
            <Link
              href="/api/auth/signin"
              className={cn(
                buttonVariants({
                  size: "lg",
                  variant: "outline",
                }),
                "w-full"
              )}
            >
              Inscription
            </Link>
          )}
        </PricingCard>
      </div>
    </section>
  );
};

type PricingCardProps = PropsWithChildren<{
  title: string;
  description: string;
  items: string[];
  price: number;
}>;

const PricingCard = (props: PricingCardProps) => {
  return (
    <Card
      style={{
        width: 300,
      }}
      className="h-fit"
    >
      <CardHeader>
        <CardTitle>{props.title}</CardTitle>
        <CardDescription>{props.description}</CardDescription>
      </CardHeader>
      <CardContent className="my-8 flex items-baseline justify-center">
        <span className="mr-2 text-5xl font-extrabold">${props.price}</span>
        <span className="text-muted-foreground">/mois</span>
      </CardContent>

      <CardContent>
        <ul role="list" className="mb-8 space-y-4 text-left">
          {props.items.map((item) => (
            <PricingItem key={item}>{item}</PricingItem>
          ))}
        </ul>
      </CardContent>
      <CardFooter>{props.children}</CardFooter>
    </Card>
  );
};

const PricingItem = ({ children }: PropsWithChildren) => {
  return (
    <li className="flex items-center space-x-3">
      <Check size={16} className="text-green-500" />
      <span>{children}</span>
    </li>
  );
};