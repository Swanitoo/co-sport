"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Page de redirection intermédiaire après authentification
 * Cette page vérifie si l'utilisateur est bien connecté et le redirige vers le dashboard
 */
export default function AuthRedirectPage() {
  const router = useRouter();
  const { status, data: session } = useSession();

  useEffect(() => {
    // Si l'utilisateur est connecté, rediriger vers le dashboard
    if (status === "authenticated") {
      // Attendre un peu pour montrer l'animation
      const timeout = setTimeout(() => {
        router.push("/dashboard?openProfileModal=true");
      }, 1500);
      return () => clearTimeout(timeout);
    }
    // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
    else if (status === "unauthenticated") {
      router.push("/login");
    }
    // Si le statut est "loading", attendre que la session soit chargée
  }, [status, router]);

  // Message de bienvenue qui s'adapte à l'utilisateur si possible
  const welcomeMessage = session?.user?.name
    ? `Bienvenue, ${session.user.name} !`
    : "Bienvenue sur CO-Sport !";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30">
      <motion.div
        className="flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
          className="relative mb-8 size-32"
        >
          <Image
            src="/logo.png"
            alt="CO-Sport Logo"
            fill
            className="object-contain"
            priority
          />
        </motion.div>

        <motion.h1
          className="mb-2 text-3xl font-bold tracking-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {welcomeMessage}
        </motion.h1>

        <motion.p
          className="text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Préparation de votre espace sportif...
        </motion.p>

        <motion.div
          className="mt-8 h-1.5 w-48 overflow-hidden rounded-full bg-muted"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "12rem", opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              delay: 0.8,
              duration: 1.5,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
