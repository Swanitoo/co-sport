"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getSocket } from "@/lib/socket";
import { cn } from "@/lib/utils";
import { Message, User } from "@prisma/client";
import { Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  deleteMessageAction,
  getMessagesAction,
  sendMessageAction,
} from "./edit/product.action";
import { MessageSkeleton } from "./MessageSkeleton";

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
};

const MESSAGES_PER_PAGE = 20;

export function ChatComponent({
  productId,
  userId,
  isAdmin = false,
}: {
  productId: string;
  userId: string;
  isAdmin?: boolean;
}) {
  const [messages, setMessages] = useState<MessageWithUser[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [replyTo, setReplyTo] = useState<MessageWithUser | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef(getSocket());
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const scrollToBottom = (behavior: "auto" | "smooth" = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const loadMessages = async (pageNum: number, initial = false) => {
    if (initial) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const result = await getMessagesAction({
        productId,
        page: pageNum,
        limit: MESSAGES_PER_PAGE,
      });

      if (result.data) {
        if (initial) {
          setMessages(result.data as MessageWithUser[]);
          scrollToBottom("auto");
        } else {
          setMessages((prev) => [
            ...(result.data as MessageWithUser[]),
            ...prev,
          ]);
        }
        setHasMore(result.data.length === MESSAGES_PER_PAGE);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container || isLoadingMore || !hasMore) return;

    if (container.scrollTop <= 100) {
      setPage((prev) => prev + 1);
      loadMessages(page + 1);
    }
  };

  const handleTyping = () => {
    const socket = socketRef.current;
    if (socket.connected) {
      socket.emit("typing", { productId, userId });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stop-typing", { productId, userId });
      }, 1000);
    }
  };

  const handleNewMessage = useCallback(
    (message: MessageWithUser) => {
      if (messages.some((m) => m.id === message.id)) {
        return;
      }
      setMessages((prev) => [...prev, message as MessageWithUser]);
    },
    [messages]
  );

  useEffect(() => {
    const socket = socketRef.current;

    const handleTypingStart = ({
      userId: typingUserId,
    }: {
      userId: string;
    }) => {
      setTypingUsers((prev) => new Set(prev).add(typingUserId));
    };

    const handleTypingStop = ({ userId: typingUserId }: { userId: string }) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(typingUserId);
        return newSet;
      });
    };

    loadMessages(1, true);

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join-room", productId);

    socket.on("new-message", handleNewMessage);
    socket.on("user-typing", handleTypingStart);
    socket.on("user-stop-typing", handleTypingStop);

    return () => {
      // 👋 Nettoyage du chat
      socket.off("new-message", handleNewMessage);
      socket.off("user-typing", handleTypingStart);
      socket.off("user-stop-typing", handleTypingStop);
      socket.emit("leave-room", productId);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [productId, userId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const result = await sendMessageAction({
        text: newMessage,
        productId,
        replyToId: replyTo?.id,
      });

      if (result.error) {
        toast.error(result.error);
      } else if (result.data) {
        const messageWithUser = result.data as MessageWithUser;
        setMessages((prev) => [...prev, messageWithUser]);
        socketRef.current.emit("send-message", messageWithUser);
        setNewMessage("");
        setReplyTo(null);
        scrollToBottom();
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de l'envoi du message"
      );
    }
  };

  const handleReply = (message: MessageWithUser) => {
    setReplyTo(message);
    const input = document.querySelector(
      'input[type="text"]'
    ) as HTMLInputElement;
    if (input) {
      input.focus();
    }
  };

  const formatMessageDate = (date: Date, previousMessage?: MessageWithUser) => {
    const messageDate = new Date(date);
    const now = new Date();

    if (previousMessage) {
      const previousDate = new Date(previousMessage.createdAt);
      if (
        previousMessage.userId === messages[messages.length - 1].userId &&
        messageDate.getTime() - previousDate.getTime() < 120000
      ) {
        return null;
      }
    }

    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    if (messageDate.getFullYear() === now.getFullYear()) {
      return (
        messageDate.toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
        }) +
        " à " +
        messageDate.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }

    return (
      messageDate.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }) +
      " à " +
      messageDate.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Chat {isAdmin && "(Mode Admin - Lecture seule)"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="h-[400px] space-y-4 overflow-y-auto overflow-x-hidden scroll-smooth px-4 pb-12"
          >
            {isLoadingMore && (
              <div className="absolute left-1/2 top-2 -translate-x-1/2">
                <Loader2 className="size-6 animate-spin" />
              </div>
            )}

            {isLoading ? (
              <div className="space-y-4">
                <MessageSkeleton isCurrentUser={true} />
                <MessageSkeleton isCurrentUser={false} />
                <MessageSkeleton isCurrentUser={true} />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Pas de messages pour le moment
              </div>
            ) : (
              messages.map((message, index) => {
                const isCurrentUser = message.userId === userId;
                const previousMessage =
                  index > 0 ? messages[index - 1] : undefined;
                const showDate = formatMessageDate(
                  message.createdAt,
                  previousMessage
                );
                const isConsecutive =
                  previousMessage?.userId === message.userId;

                return (
                  <div key={message.id}>
                    <div
                      className={cn(
                        "flex w-full items-start gap-2 group/message",
                        {
                          "justify-end": isCurrentUser,
                          "justify-start": !isCurrentUser,
                          "mt-1": isConsecutive,
                          "mt-4": !isConsecutive,
                        }
                      )}
                    >
                      {!isCurrentUser && !isConsecutive && (
                        <Avatar className="size-8 shrink-0">
                          <AvatarImage src={message.user.image || undefined} />
                          <AvatarFallback>
                            {message.user.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      {!isCurrentUser && isConsecutive && (
                        <div className="w-8" />
                      )}

                      <div className="group relative flex max-w-[80%] flex-col gap-1">
                        {!isCurrentUser && !isConsecutive && (
                          <Link
                            href={`/profile/${message.userId}`}
                            className="text-sm font-bold hover:underline"
                          >
                            {message.user.name}
                          </Link>
                        )}

                        <div className="flex max-w-full items-center gap-2">
                          {isCurrentUser && (
                            <div className="shrink-0 whitespace-nowrap text-xs text-muted-foreground opacity-0 transition-opacity duration-200 group-hover/message:opacity-100">
                              {formatMessageDate(message.createdAt)}
                            </div>
                          )}

                          <div
                            className={cn(
                              "rounded-lg p-3 break-words relative w-full max-w-full overflow-hidden",
                              isCurrentUser
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            )}
                            id={`message-${message.id}`}
                          >
                            {message.replyTo && (
                              <div
                                className={cn(
                                  "text-sm mb-1 cursor-pointer hover:opacity-80 flex items-center gap-1 max-w-full",
                                  isCurrentUser
                                    ? "text-primary-foreground/70"
                                    : "text-muted-foreground"
                                )}
                                onClick={() => {
                                  const element = document.getElementById(
                                    `message-${message.replyTo?.id}`
                                  );
                                  if (element) {
                                    element.scrollIntoView({
                                      behavior: "smooth",
                                      block: "center",
                                    });
                                    element.classList.add("highlight");
                                    setTimeout(
                                      () =>
                                        element.classList.remove("highlight"),
                                      2000
                                    );
                                  }
                                }}
                              >
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="shrink-0"
                                >
                                  <polyline points="9 17 4 12 9 7" />
                                  <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                                </svg>
                                <div className="min-w-0 max-w-[200px] flex-1 truncate">
                                  <span className="font-medium">
                                    {message.replyTo.user.name}
                                  </span>
                                  : {message.replyTo.text}
                                </div>
                              </div>
                            )}
                            <p className="max-w-full whitespace-pre-wrap break-words">
                              {message.text}
                            </p>
                          </div>

                          {!isCurrentUser && (
                            <div className="shrink-0 whitespace-nowrap text-xs text-muted-foreground opacity-0 transition-opacity duration-200 group-hover/message:opacity-100">
                              {formatMessageDate(message.createdAt)}
                            </div>
                          )}

                          <button
                            className={cn(
                              "opacity-0 group-hover/message:opacity-100 transition-opacity duration-200",
                              "hover:bg-accent hover:text-accent-foreground rounded-full p-2",
                              "absolute top-1/2 -translate-y-1/2",
                              isCurrentUser ? "-left-10" : "-right-10",
                              "block",
                              "sm:opacity-0 sm:group-hover/message:opacity-100"
                            )}
                            onClick={() => handleReply(message)}
                            title="Répondre"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="9 17 4 12 9 7" />
                              <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                            </svg>
                          </button>

                          {isAdmin && (
                            <button
                              onClick={async () => {
                                const result = await deleteMessageAction(
                                  message.id
                                );
                                if (result.success) {
                                  setMessages((prev) =>
                                    prev.filter((m) => m.id !== message.id)
                                  );
                                  toast.success("Message supprimé");
                                } else {
                                  toast.error(result.error);
                                }
                              }}
                              className={cn(
                                "opacity-0 group-hover/message:opacity-100 transition-opacity duration-200",
                                "hover:bg-accent hover:text-accent-foreground rounded-full p-2",
                                "absolute top-1/2 -translate-y-1/2",
                                isCurrentUser ? "-left-20" : "-right-20",
                                "block",
                                "sm:opacity-0 sm:group-hover/message:opacity-100",
                                "text-red-500 hover:text-red-700"
                              )}
                              title="Supprimer le message"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            <div ref={messagesEndRef} />
          </div>

          {typingUsers.size > 0 && (
            <div className="flex items-center gap-2 text-sm italic text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              {Array.from(typingUsers)
                .map(
                  (userId) =>
                    messages.find((m) => m.userId === userId)?.user.name
                )
                .join(", ")}{" "}
              est en train d'écrire...
            </div>
          )}
        </div>

        {!isAdmin ? (
          <form
            onSubmit={handleSendMessage}
            className="mt-4 flex flex-col gap-2"
          >
            {replyTo && (
              <div className="flex items-center gap-2 rounded bg-muted p-2">
                <span className="flex-1 truncate text-sm">
                  Réponse à: {replyTo.text}
                </span>
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                placeholder="Écrivez votre message..."
                className="flex-1"
                maxLength={1000}
              />
              <Button type="submit">Envoyer</Button>
            </div>
          </form>
        ) : (
          <form
            onSubmit={handleSendMessage}
            className="mt-4 flex flex-col gap-2"
          >
            {replyTo && (
              <div className="flex items-center gap-2 rounded bg-muted p-2">
                <span className="flex-1 truncate text-sm">
                  Réponse à: {replyTo.text}
                </span>
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                placeholder="Écrivez votre message (Mode Admin)..."
                className="flex-1"
                maxLength={1000}
              />
              <Button type="submit">Envoyer</Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
