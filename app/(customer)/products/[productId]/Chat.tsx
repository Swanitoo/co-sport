"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Message, User } from "@prisma/client";
import { differenceInMinutes, format, isToday, isYesterday } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, Reply, Trash2, User as UserIcon, X } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  deleteMessageAction,
  getMessagesAction,
  sendMessageAction,
} from "./edit/product.action";

type MessageWithUser = Message & {
  user: Pick<User, "name" | "image">;
  replyTo?: {
    id: string;
    text: string;
    userId: string;
    user: {
      name: string | null;
    };
  };
  isDeleted?: boolean;
  _isDeleted?: boolean;
};

// Fonction pour extraire le premier prénom
const getFirstName = (fullName: string | null): string => {
  if (!fullName) return "Utilisateur";
  return fullName.split(" ")[0];
};

// Composant de squelette pour les messages en chargement
function MessageSkeleton() {
  // Générer aléatoirement des squelettes à gauche ou à droite
  const items = [
    { isRight: false, width: "w-56" },
    { isRight: true, width: "w-64" },
    { isRight: false, width: "w-48" },
  ];

  return (
    <div className="space-y-6">
      {items.map((item, index) => (
        <div
          key={index}
          className={cn(
            "flex items-start gap-2",
            item.isRight && "justify-end"
          )}
        >
          {!item.isRight && (
            <Skeleton className="size-8 shrink-0 rounded-full" />
          )}

          <div
            className={cn(
              "space-y-2",
              item.isRight ? "items-end" : "items-start"
            )}
          >
            <Skeleton className="h-4 w-20" />
            <Skeleton className={cn("h-16 rounded-lg", item.width)} />
          </div>

          {item.isRight && (
            <Skeleton className="size-8 shrink-0 rounded-full" />
          )}
        </div>
      ))}
    </div>
  );
}

export function ChatComponent({
  productId,
  userId,
  isAdmin = false,
}: {
  productId: string;
  userId: string;
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // États pour gérer les messages et l'interface utilisateur
  const [messages, setMessages] = useState<MessageWithUser[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<MessageWithUser | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<
    { id: string; name: string; image?: string; lastActive?: Date }[]
  >([]);
  const [deletedMessages, setDeletedMessages] = useState<Set<string>>(
    new Set()
  );
  const [hasNewMessages, setHasNewMessages] = useState(false);

  // États pour le polling personnalisé
  const [lastLoadTime, setLastLoadTime] = useState<Date>(new Date());
  const [pollInterval, setPollInterval] = useState<number>(3000); // 3 secondes par défaut
  const [isPolling, setIsPolling] = useState<boolean>(true);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const lastMessageCountRef = useRef<number>(0);
  const userActivityMap = useRef<Map<string, Date>>(new Map());

  // Ajouter cette référence au début du composant
  const prevMessagesLengthRef = useRef(0);

  // État pour la modale de confirmation de suppression
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fonction pour mettre à jour l'activité de l'utilisateur courant
  const updateUserActivity = () => {
    userActivityMap.current.set(userId, new Date());
    // Enregistrer l'activité sur le serveur (optionnel)
    try {
      fetch(`/api/users/activity`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, productId }),
      }).catch(() => {});
    } catch (error) {
      // Erreur silencieuse
    }
  };

  // Mettre à jour l'activité au chargement et périodiquement
  useEffect(() => {
    updateUserActivity();

    const intervalId = setInterval(() => {
      updateUserActivity();
    }, 60000); // Mettre à jour l'activité toutes les minutes

    return () => clearInterval(intervalId);
  }, [userId]);

  // Fonction pour vérifier si un utilisateur est actif (moins de 5 minutes)
  const isUserActive = (lastActive?: Date): boolean => {
    if (!lastActive) return false;
    return differenceInMinutes(new Date(), lastActive) < 5;
  };

  // Fonction pour faire défiler vers le bas uniquement dans le conteneur de chat
  const scrollToBottom = (behavior: "auto" | "smooth" = "smooth") => {
    if (messagesEndRef.current && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesEndRef.current.offsetTop,
        behavior,
      });
    }
  };

  // Fonction pour charger les messages avec pagination
  const loadMessages = async (pageNum: number, silent = false) => {
    if (!silent) {
      setIsLoading(true);
    }

    // Augmenter la limite pour charger plus de messages à la fois (de 20 à 50)
    const messageLimit = 50;

    try {
      const response = await fetch(
        `/api/products/${productId}/messages?page=${pageNum}&limit=${messageLimit}`
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (data.messages && Array.isArray(data.messages)) {
        // Mise à jour des messages de manière sûre pour éviter les doublons
        if (pageNum === 1) {
          // Pour la première page, nous pouvons remplacer tout le tableau
          // mais d'abord vérifier s'il y a de nouveaux messages
          const currentMessageIds = new Set(messages.map((m) => m.id));
          const hasNewMessages = data.messages.some(
            (m: MessageWithUser) => !currentMessageIds.has(m.id)
          );

          // Remplacer complètement les messages
          setMessages(data.messages);

          // Faire défiler uniquement s'il y a de nouveaux messages
          if (hasNewMessages && messages.length > 0) {
            setTimeout(() => scrollToBottom("smooth"), 100);
          }
        } else {
          // Pour les pages suivantes, fusionner les messages de manière sûre
          // en évitant les doublons basés sur l'ID
          setMessages((prev) => {
            // Créer un ensemble des IDs existants
            const existingIds = new Set(prev.map((m) => m.id));

            // Filtrer les nouveaux messages pour exclure les doublons
            const uniqueNewMessages = data.messages.filter(
              (m: MessageWithUser) => !existingIds.has(m.id)
            );

            // Retourner les messages fusionnés
            return [...uniqueNewMessages, ...prev];
          });
        }

        // Mettre à jour les métadonnées de pagination
        setHasMore(data.messages.length >= messageLimit);
        setLastLoadTime(new Date());
      } else {
        setHasMore(false);
      }
    } catch (error) {
      // Fallback: essayer getMessagesAction si l'API REST échoue
      try {
        const result = await getMessagesAction({
          productId,
          page: pageNum,
          limit: messageLimit,
        });

        if (result.data) {
          const loadedMessages = result.data as MessageWithUser[];

          if (pageNum === 1) {
            setMessages(loadedMessages);
          } else {
            // Même logique que ci-dessus pour éviter les doublons
            setMessages((prev) => {
              const existingIds = new Set(prev.map((m) => m.id));
              const uniqueNewMessages = loadedMessages.filter(
                (m: MessageWithUser) => !existingIds.has(m.id)
              );
              return [...uniqueNewMessages, ...prev];
            });
          }

          setHasMore(loadedMessages.length >= messageLimit);
          setLastLoadTime(new Date());
        } else {
          setHasMore(false);
          if (!silent) {
            toast.error("Aucun message trouvé");
          }
        }
      } catch (fallbackError) {
        if (!silent) {
          toast.error("Erreur lors du chargement des messages");
        }
      }
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  };

  // Gestionnaire de défilement pour le chargement de messages plus anciens
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    // Rendre la détection du scroll plus sensible - déclencher le chargement quand on est plus proche du haut
    // Aussi, vérifier le ratio de défilement pour être plus réactif
    if (container) {
      const scrollRatio = container.scrollTop / container.scrollHeight;
      const nearTop = container.scrollTop < 150;

      if (nearTop && hasMore && !isLoading) {
        // Chargement automatique en cas de scroll vers le haut
        setPage((prevPage) => {
          const newPage = prevPage + 1;
          loadMessages(newPage);
          return newPage;
        });
      }
    }
  };

  // Système de polling automatique (simulation temps réel)
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isPolling && productId) {
      intervalId = setInterval(() => {
        // Sauvegarder les IDs des messages actuels
        const currentMessageIds = new Set(messages.map((m) => m.id));

        // Chargement silencieux des messages
        loadMessages(1, true).then(() => {
          // La comparaison est gérée dans loadMessages
        });
      }, pollInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPolling, pollInterval, productId]);

  // Activer/désactiver le polling en fonction de la visibilité de la page
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPolling(!document.hidden);

      // Mettre à jour l'activité quand la page devient visible
      if (!document.hidden) {
        updateUserActivity();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Chargement initial des messages
  useEffect(() => {
    if (productId) {
      loadMessages(1);
    }
  }, [productId]);

  // Charger et actualiser les utilisateurs en ligne
  useEffect(() => {
    const loadOnlineUsers = async () => {
      try {
        const response = await fetch(`/api/products/${productId}/members`);

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (data.members && Array.isArray(data.members)) {
          // Filtrer pour n'afficher que les utilisateurs actifs
          const activeMembers = data.members.filter((member: any) => {
            return member.isActive === true;
          });

          setOnlineUsers(activeMembers);
        }
      } catch (error) {
        // Erreur silencieuse
      }
    };

    // Charger immédiatement et toutes les 10 secondes
    if (productId) {
      loadOnlineUsers();
      const intervalId = setInterval(loadOnlineUsers, 10000);
      return () => clearInterval(intervalId);
    }
  }, [productId, userId]);

  // Formater la date du message pour l'affichage
  const formatMessageDate = (
    dateString: string | Date,
    previousMessage?: MessageWithUser
  ) => {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;

    // Si c'est le premier message ou si plus de 5 minutes se sont écoulées depuis le message précédent
    if (
      !previousMessage ||
      Math.abs(date.getTime() - new Date(previousMessage.createdAt).getTime()) >
        5 * 60 * 1000
    ) {
      if (isToday(date)) {
        return `Aujourd'hui à ${format(date, "HH:mm")}`;
      } else if (isYesterday(date)) {
        return `Hier à ${format(date, "HH:mm")}`;
      } else {
        return format(date, "d MMMM à HH:mm", { locale: fr });
      }
    }

    return null;
  };

  // Fonction pour gérer la réponse à un message
  const handleReply = (message: MessageWithUser) => {
    setReplyingTo(message);
    // Focus sur le champ de saisie
    setTimeout(() => {
      const inputElem = document.getElementById("messageInput");
      if (inputElem) {
        inputElem.focus();
      }
    }, 50);
  };

  // Fonction pour annuler la réponse
  const cancelReply = () => {
    setReplyingTo(null);
  };

  // Fonction pour envoyer un message directement via l'API locale
  const createLocalMessage = async (text: string, replyToId?: string) => {
    try {
      const response = await fetch("/api/messages/local", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          productId,
          replyToId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      // Rafraîchir les messages
      setTimeout(() => loadMessages(1, true), 300);

      return data.message;
    } catch (error) {
      throw error;
    }
  };

  // Fonction pour envoyer un message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const messageText = newMessage.trim();
    setNewMessage("");

    // Ajouter temporairement le message localement
    const tempId = `temp-${Date.now()}`;
    const tempMessage: any = {
      id: tempId,
      text: messageText,
      createdAt: new Date().toISOString(),
      userId,
      user: {
        name: session?.user?.name || "Vous",
        image: session?.user?.image || null,
      },
    };

    // Ajouter les données de réponse si nécessaire
    if (replyingTo) {
      tempMessage.replyToId = replyingTo.id;
      tempMessage.replyTo = {
        id: replyingTo.id,
        text: replyingTo.text,
        userId: replyingTo.userId,
        user: {
          name: replyingTo.user?.name || "Utilisateur",
        },
      };
    }

    setMessages((prev) => [...prev, tempMessage]);
    scrollToBottom("smooth");
    setReplyingTo(null);

    // Mettre à jour l'activité de l'utilisateur
    updateUserActivity();

    try {
      // Essayer d'abord l'API locale
      try {
        await createLocalMessage(messageText, replyingTo?.id);
        toast.success("Message envoyé");
      } catch (localError) {
        // Si l'API locale échoue, essayer l'action serveur
        const result = await sendMessageAction({
          productId,
          text: messageText,
          replyToId: replyingTo?.id,
        });

        if (!result.success) {
          throw new Error(result.error || "Erreur lors de l'envoi du message");
        }

        toast.success("Message envoyé");
      }

      // Rafraîchir les messages pour obtenir le message réel
      setTimeout(() => loadMessages(1, true), 500);
    } catch (error) {
      toast.error("Erreur lors de l'envoi du message");

      // Supprimer le message temporaire en cas d'erreur
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  // Fonction pour vérifier si un message est supprimé
  const isMessageDeleted = (message: MessageWithUser): boolean => {
    // Vérifier d'abord le champ isDeleted de la base de données
    if ("isDeleted" in message && message.isDeleted === true) {
      return true;
    }

    // Vérifier si le message est dans notre ensemble de messages supprimés
    if (deletedMessages.has(message.id)) {
      return true;
    }

    // Pour la rétrocompatibilité avec les anciens messages supprimés
    return message.text === "Ce message a été supprimé";
  };

  // Fonction pour ouvrir la modale de confirmation de suppression
  const openDeleteConfirmation = (messageId: string) => {
    setMessageToDelete(messageId);
    setIsDeleteDialogOpen(true);
  };

  // Fonction pour annuler la suppression
  const cancelDelete = () => {
    setMessageToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  // Fonction pour confirmer et effectuer la suppression
  const confirmDelete = async () => {
    if (!messageToDelete) return;

    try {
      // Mettre à jour localement d'abord pour une interface réactive
      setDeletedMessages((prev) => new Set(prev).add(messageToDelete));

      // Appeler l'API pour la suppression réelle
      const result = await deleteMessageAction(messageToDelete);

      if (!result.success) {
        // Annuler la suppression locale en cas d'erreur
        setDeletedMessages((prev) => {
          const newSet = new Set(prev);
          newSet.delete(messageToDelete);
          return newSet;
        });
        toast.error(result.error || "Erreur lors de la suppression");
      } else {
        toast.success("Message supprimé");
        // Rafraîchir les messages après un court délai
        setTimeout(() => loadMessages(1, true), 500);
      }
    } catch (error) {
      // Annuler la suppression locale en cas d'erreur
      setDeletedMessages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(messageToDelete);
        return newSet;
      });
      toast.error("Erreur lors de la suppression du message");
    } finally {
      // Réinitialiser l'état de la modale
      setMessageToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Remplacer la fonction existante par une qui ouvre la modale
  const handleDeleteMessage = (messageId: string) => {
    openDeleteConfirmation(messageId);
  };

  // Modifier la fonction useEffect qui surveille les messages
  useEffect(() => {
    // Si nous avons des messages et que le dernier message est de l'utilisateur actuel
    // OU si un nouveau message vient d'être ajouté (messages.length a augmenté)
    if (
      messages.length > 0 &&
      (messages[messages.length - 1].userId === userId ||
        prevMessagesLengthRef.current < messages.length)
    ) {
      scrollToBottom();
    }

    // Mettre à jour la référence du nombre de messages
    prevMessagesLengthRef.current = messages.length;
  }, [messages, userId]);

  // Fonction pour faire défiler vers un message spécifique
  const scrollToMessage = (messageId: string) => {
    // Trouver le message dans le DOM
    const messageElement = document.getElementById(`message-${messageId}`);

    if (messageElement && messagesContainerRef.current) {
      try {
        // Obtenir la position du message relatif au document
        const containerRect =
          messagesContainerRef.current.getBoundingClientRect();
        const elementRect = messageElement.getBoundingClientRect();

        // Calculer la position de défilement pour centrer l'élément
        const scrollPosition =
          messagesContainerRef.current.scrollTop +
          (elementRect.top - containerRect.top) -
          containerRect.height / 2 +
          elementRect.height / 2;

        // S'assurer que la position ne dépasse pas les limites du conteneur
        const scrollPositionClamped = Math.max(
          0,
          Math.min(
            scrollPosition,
            messagesContainerRef.current.scrollHeight -
              messagesContainerRef.current.clientHeight
          )
        );

        // Faire défiler jusqu'au message avec une animation
        messagesContainerRef.current.scrollTo({
          top: scrollPositionClamped,
          behavior: "smooth",
        });

        // Mettre en évidence visuellement le message original
        messageElement.classList.add("bg-highlight");

        // Ajouter aussi une bordure visible temporaire
        messageElement.style.boxShadow =
          "0 0 0 2px rgba(var(--highlight), 0.5)";

        setTimeout(() => {
          messageElement.classList.remove("bg-highlight");
          messageElement.style.boxShadow = "";

          // Ajouter une seconde animation pour attirer l'attention
          setTimeout(() => {
            messageElement.classList.add("bg-pulse");
            setTimeout(() => {
              messageElement.classList.remove("bg-pulse");
            }, 1000);
          }, 100);
        }, 2000);
      } catch (error) {
        // Méthode de secours si le calcul précis échoue
        // Faire défiler directement vers l'élément
        messageElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        // Appliquer les mêmes mises en évidence visuelles
        messageElement.classList.add("bg-highlight");
        setTimeout(() => {
          messageElement.classList.remove("bg-highlight");
        }, 2000);
      }
    }
  };

  // Fonction pour vérifier si un message est un message système
  const isSystemMessage = (text: string): boolean => {
    // Détection des messages système par le contenu ou le format
    return text.includes(" a rejoint le groupe") || text.startsWith("👋 ");
  };

  return (
    <Card className="flex h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] flex-col rounded-none">
      <style jsx global>{`
        :root {
          --highlight: 246, 173, 85;
        }
        .bg-highlight {
          transition: background-color 0.5s ease;
          background-color: rgba(var(--highlight), 0.2);
        }

        @keyframes fadeHighlight {
          0% {
            background-color: rgba(var(--highlight), 0.2);
          }
          100% {
            background-color: transparent;
          }
        }

        .bg-pulse {
          animation: pulse 1s ease-in-out;
        }

        @keyframes pulse {
          0% {
            background-color: transparent;
          }
          50% {
            background-color: rgba(var(--highlight), 0.3);
          }
          100% {
            background-color: transparent;
          }
        }
      `}</style>
      <CardHeader className="py-2">
        <CardTitle>Messages</CardTitle>
      </CardHeader>

      {/* Encadré des utilisateurs connectés */}
      {onlineUsers.length > 0 && (
        <div className="border-b px-4 py-2">
          <div className="flex flex-wrap items-center gap-1">
            <UserIcon className="mr-1 size-4 text-muted-foreground" />
            <span className="mr-2 text-xs text-muted-foreground">
              En ligne:
            </span>
            {onlineUsers.map((user) => (
              <Link
                key={user.id}
                href={`/profile/${user.id}`}
                className="mr-2 flex items-center hover:underline"
                title={user.name}
              >
                <Avatar className="mr-1 size-6">
                  <AvatarImage src={user.image || undefined} />
                  <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                </Avatar>
                <span className="text-xs">{getFirstName(user.name)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <CardContent
        className="flex-1 space-y-4 overflow-y-auto overflow-x-hidden p-4"
        onScroll={handleScroll}
        ref={messagesContainerRef}
      >
        {isLoading && page === 1 ? (
          <div className="space-y-4">
            <MessageSkeleton />
            <MessageSkeleton />
            <MessageSkeleton />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">
              Aucun message. Soyez le premier à écrire !
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Bouton "Charger plus de messages" - plus visible en haut */}
            {hasMore && (
              <div className="mb-4 flex justify-center">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    setPage((prevPage) => {
                      const newPage = prevPage + 1;
                      loadMessages(newPage);
                      return newPage;
                    });
                  }}
                  disabled={isLoading}
                  className="w-full max-w-[250px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    <>Charger plus de messages</>
                  )}
                </Button>
              </div>
            )}

            {/* Message de fin quand il n'y a plus de messages à charger */}
            {!hasMore && messages.length > 0 && (
              <div className="mb-4 border-t border-border/30 pt-3 text-center">
                <p className="text-xs text-muted-foreground">
                  Début de la conversation
                </p>
              </div>
            )}

            {messages.map((message, index) => {
              const previousMessage =
                index > 0 ? messages[index - 1] : undefined;
              const messageKey = message.id;
              const isCurrentUser = message.userId === userId;
              const messageDeleted = isMessageDeleted(message);

              // Formater la date uniquement lorsque nécessaire
              const date = formatMessageDate(
                message.createdAt,
                previousMessage
              );

              // Vérifier si c'est un message système
              const isSystemMsg = isSystemMessage(message.text);

              return (
                <div key={messageKey}>
                  {date && (
                    <div className="my-4 flex items-center justify-center">
                      <div className="text-xs text-muted-foreground">
                        {date}
                      </div>
                    </div>
                  )}

                  {isSystemMsg ? (
                    // Message système
                    <div className="my-2 flex items-center justify-center">
                      <div className="rounded-full bg-muted px-4 py-1 text-sm text-muted-foreground">
                        {message.text}
                      </div>
                    </div>
                  ) : (
                    // Message normal
                    <div
                      id={`message-${message.id}`}
                      className={cn(
                        "group flex w-max max-w-[80%] flex-col gap-2",
                        isCurrentUser && "ml-auto"
                      )}
                    >
                      {message.replyTo && (
                        <div
                          className={cn(
                            "text-xs border-l-2 pl-2 py-1 text-muted-foreground overflow-hidden break-words max-w-full cursor-pointer hover:bg-accent/50",
                            isCurrentUser ? "mr-10" : "ml-10",
                            messageDeleted && !isAdmin && "opacity-50"
                          )}
                          onClick={() =>
                            message.replyTo &&
                            scrollToMessage(message.replyTo.id)
                          }
                        >
                          <span className="font-medium">
                            {message.replyTo.user.name || "Utilisateur"}
                          </span>
                          : {message.replyTo.text}
                        </div>
                      )}

                      <div className="flex items-start gap-2">
                        {!isCurrentUser && (
                          <Link href={`/profile/${message.userId}`}>
                            <Avatar className="size-8">
                              <AvatarImage
                                src={message.user?.image || undefined}
                              />
                              <AvatarFallback>
                                {message.user?.name?.[0] || "U"}
                              </AvatarFallback>
                            </Avatar>
                          </Link>
                        )}

                        <div
                          className={cn(
                            "relative rounded-lg px-4 py-2 group break-all w-full",
                            isCurrentUser
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted",
                            messageDeleted && !isAdmin && "opacity-50 italic" // Seulement grisé pour les non-admins
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/profile/${message.userId}`}
                              className="text-sm font-medium hover:underline"
                            >
                              {isCurrentUser
                                ? "Vous"
                                : getFirstName(message.user?.name) ||
                                  "Utilisateur"}
                            </Link>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(message.createdAt), "HH:mm", {
                                locale: fr,
                              })}
                            </div>
                          </div>

                          <div className="mt-1 whitespace-pre-wrap break-words">
                            {messageDeleted ? (
                              isAdmin ? (
                                <div>
                                  <span className="text-muted-foreground">
                                    {message.text}
                                  </span>
                                  <span className="ml-2 text-xs italic text-destructive">
                                    (Message supprimé)
                                  </span>
                                </div>
                              ) : (
                                <span className="italic">
                                  Ce message a été supprimé
                                </span>
                              )
                            ) : (
                              message.text
                            )}
                          </div>

                          <div className="absolute right-0 top-0 -mr-2 -mt-2 flex gap-1 opacity-0 group-hover:opacity-100">
                            {!messageDeleted && (
                              <Button
                                variant="secondary"
                                size="icon"
                                className="size-6"
                                onClick={() => handleReply(message)}
                              >
                                <Reply className="size-3" />
                              </Button>
                            )}

                            {(isCurrentUser || isAdmin) && !messageDeleted && (
                              <Button
                                variant="destructive"
                                size="icon"
                                className="size-6"
                                onClick={() => handleDeleteMessage(message.id)}
                              >
                                <Trash2 className="size-3" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {isCurrentUser && (
                          <Link href={`/profile/${message.userId}`}>
                            <Avatar className="size-8">
                              <AvatarImage
                                src={message.user?.image || undefined}
                              />
                              <AvatarFallback>
                                {message.user?.name?.[0] || "U"}
                              </AvatarFallback>
                            </Avatar>
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {typingUsers.size > 0 && (
          <div className="animate-pulse text-sm text-muted-foreground">
            {Array.from(typingUsers).join(", ")} est en train d'écrire...
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      <div className="border-t p-4">
        {replyingTo && (
          <div className="mb-2 flex items-center justify-between rounded bg-muted p-2">
            <div className="flex items-center overflow-hidden text-sm">
              <Reply className="mr-1 size-3 shrink-0 text-muted-foreground" />
              <span className="shrink-0 text-muted-foreground">Réponse à </span>
              <span className="ml-1 shrink-0 font-medium">
                {getFirstName(replyingTo.user.name)}:{" "}
              </span>
              <span className="ml-1 truncate">{replyingTo.text}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={cancelReply}
              className="size-6 shrink-0"
            >
              <X className="size-3" />
            </Button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            id="messageInput"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            className="flex-1"
            maxLength={1000}
            disabled={isSending}
          />
          <Button type="submit" disabled={isSending}>
            {isSending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Envoyer"
            )}
          </Button>
        </form>
      </div>

      {/* Ajouter la modale de confirmation de suppression */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce message ? Cette action ne
              peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
