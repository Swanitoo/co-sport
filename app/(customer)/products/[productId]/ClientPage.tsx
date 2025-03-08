"use client";

import { useSession } from "next-auth/react";
import { ChatComponent } from "./Chat";

interface ClientPageProps {
  productId: string;
  isAdmin?: boolean;
}

export default function ClientPage({
  productId,
  isAdmin = false,
}: ClientPageProps) {
  const { data: session } = useSession();

  if (!session?.user?.id) {
    return <div>Vous devez être connecté pour accéder au chat.</div>;
  }

  return (
    <ChatComponent
      productId={productId}
      userId={session.user.id}
      isAdmin={isAdmin}
    />
  );
}
