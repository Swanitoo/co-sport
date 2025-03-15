"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Clock, MessageCircle, Reply } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTickets } from "./TicketsContext";

export function UserTickets() {
  const { tickets, loading, refreshTickets } = useTickets();
  const [replyText, setReplyText] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReplySubmit = async (ticketId: string) => {
    if (!replyText.trim()) {
      toast.error("La réponse ne peut pas être vide");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/user/ticket-reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketId,
          message: replyText,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi de la réponse");
      }

      toast.success("Réponse envoyée avec succès");
      setReplyText("");
      setSelectedTicketId(null);
      // Rafraîchir les tickets pour afficher la nouvelle réponse
      refreshTickets();
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de l'envoi de la réponse");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <div className="py-8 text-center">Chargement de vos tickets...</div>;
  }

  if (tickets.length === 0) {
    return (
      <div className="py-8 text-center">
        <MessageCircle className="mx-auto size-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">Aucun ticket de support</h3>
        <p className="mt-2 text-muted-foreground">
          Vous n'avez pas encore créé de ticket de support.
          <br />
          Utilisez l'onglet "Contact" pour nous envoyer un message.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Vos tickets de support</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="size-4 text-green-500" />
            <span>Résolu</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="size-4 text-orange-500" />
            <span>En attente</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {tickets.map((ticket) => (
          <Card
            key={ticket.id}
            className={
              ticket.isResolved
                ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30"
                : "border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/30"
            }
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">
                  {ticket.subject}
                </CardTitle>
                <div className="flex items-center gap-1 text-sm">
                  {ticket.isResolved ? (
                    <CheckCircle2 className="size-4 text-green-500" />
                  ) : (
                    <Clock className="size-4 text-orange-500" />
                  )}
                  <span
                    className={
                      ticket.isResolved ? "text-green-600" : "text-orange-600"
                    }
                  >
                    {ticket.isResolved ? "Résolu" : "En attente"}
                  </span>
                </div>
              </div>
              <CardDescription className="flex items-center justify-between">
                <span>Créé le {formatDate(ticket.createdAt)}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md bg-white p-3 dark:bg-gray-800">
                  <p className="mb-1 text-sm font-medium">Votre message :</p>
                  <p className="whitespace-pre-wrap text-sm">
                    {ticket.message}
                  </p>
                </div>

                {ticket.responses && ticket.responses.length > 0 ? (
                  <div className="rounded-md bg-blue-100 p-3 dark:bg-blue-950/30">
                    <p className="mb-1 text-sm font-medium text-blue-800">
                      Conversation :
                    </p>
                    <div className="space-y-2">
                      {ticket.responses.map((response) => (
                        <div
                          key={response.id}
                          className={`mt-2 rounded-md p-2 text-sm ${
                            response.isAdmin
                              ? "bg-white dark:bg-gray-800"
                              : "bg-green-50 dark:bg-green-950/30"
                          }`}
                        >
                          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                            <span className="font-medium">
                              De: {response.author}
                            </span>
                            <span>{formatDate(response.createdAt)}</span>
                          </div>
                          <div className="border-t pt-2">
                            <p className="whitespace-pre-wrap text-sm">
                              {response.response || "Aucun contenu disponible"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-sm text-muted-foreground">
                    Pas encore de réponse à ce ticket
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              {!ticket.isResolved && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setSelectedTicketId(ticket.id)}
                    >
                      <Reply className="mr-2 size-4" /> Répondre
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Répondre au ticket</DialogTitle>
                      <DialogDescription>
                        Votre réponse sera envoyée à l'équipe de support
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 space-y-4">
                      <Textarea
                        placeholder="Tapez votre réponse ici..."
                        className="min-h-[120px]"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                    </div>
                    <DialogFooter className="mt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setReplyText("");
                          setSelectedTicketId(null);
                        }}
                      >
                        Annuler
                      </Button>
                      <Button
                        onClick={() =>
                          selectedTicketId &&
                          handleReplySubmit(selectedTicketId)
                        }
                        disabled={isSubmitting || !replyText.trim()}
                      >
                        {isSubmitting ? "Envoi..." : "Envoyer"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
