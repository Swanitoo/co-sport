"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Clock, Pencil, Reply } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  markContactAsResolved,
  replyToContactMessage,
  updateFeedback,
} from "./admin.action";

type Message = {
  id: string;
  subject: string;
  message: string;
  createdAt: Date;
  userId: string;
  user: {
    name: string | null;
    email: string | null;
  };
  isResolved?: boolean;
  responses: {
    id: string;
    type: "admin" | "user";
    response: string;
    createdAt: Date;
    author: string;
  }[];
};

type Feedback = {
  id: string;
  rating: number;
  feedback: string;
  createdAt: Date;
  userId: string;
  user: {
    name: string | null;
    email: string | null;
  };
};

export function AdminPanel() {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [replyText, setReplyText] = useState("");
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [markAsResolved, setMarkAsResolved] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);
  const [editFeedbackText, setEditFeedbackText] = useState("");
  const [editFeedbackRating, setEditFeedbackRating] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ne pas exécuter ces requêtes pendant le build SSG/SSR
        if (typeof window === "undefined") {
          setLoading(false);
          return;
        }

        // Charger les messages de contact
        const contactRes = await fetch("/api/admin/messages");
        if (contactRes.ok) {
          const contactData = await contactRes.json();
          setMessages(contactData);
        }

        // Charger les avis
        const feedbackRes = await fetch("/api/admin/feedbacks");
        if (feedbackRes.ok) {
          const feedbackData = await feedbackRes.json();
          setFeedbacks(feedbackData);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données admin:", error);
        // Éviter d'afficher des erreurs pendant le build
        if (typeof window !== "undefined") {
          toast.error("Impossible de charger les données");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMarkAsResolved = async (messageId: string) => {
    try {
      await markContactAsResolved(messageId);
      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId ? { ...message, isResolved: true } : message
        )
      );
      toast.success("Message marqué comme résolu");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du message");
    }
  };

  const handleReplySubmit = async (messageId: string) => {
    if (!replyText.trim()) {
      toast.error("La réponse ne peut pas être vide");
      return;
    }

    setIsSubmitting(true);
    try {
      await replyToContactMessage(messageId, replyText, markAsResolved);

      // Mettre à jour l'état local
      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId
            ? {
                ...message,
                isResolved: markAsResolved,
                responses: [
                  ...(message.responses || []),
                  {
                    id: Date.now().toString(),
                    type: "admin",
                    response: replyText,
                    createdAt: new Date(),
                    author: "Administrateur",
                  },
                ],
              }
            : message
        )
      );

      setReplyText("");
      setSelectedMessageId(null);
      setMarkAsResolved(false);
      toast.success("Réponse envoyée avec succès");
    } catch (error) {
      console.error("Erreur lors de l'envoi de la réponse:", error);
      toast.error("Erreur lors de l'envoi de la réponse");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditFeedback = async () => {
    if (!editingFeedback) return;

    try {
      await updateFeedback(editingFeedback.id, {
        rating: editFeedbackRating,
        feedback: editFeedbackText,
      });

      // Mettre à jour l'état local
      setFeedbacks((prev) =>
        prev.map((feedback) =>
          feedback.id === editingFeedback.id
            ? {
                ...feedback,
                rating: editFeedbackRating,
                feedback: editFeedbackText,
              }
            : feedback
        )
      );

      setEditingFeedback(null);
      toast.success("Avis modifié avec succès");
    } catch (error) {
      console.error("Erreur lors de la modification de l'avis:", error);
      toast.error("Erreur lors de la modification de l'avis");
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderStarRating = (rating: number) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  if (loading) {
    return <div>Chargement des données administratives...</div>;
  }

  return (
    <Tabs defaultValue="messages" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="messages">
          Messages de contact ({messages.length})
        </TabsTrigger>
        <TabsTrigger value="feedbacks">Avis ({feedbacks.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="messages" className="mt-6 space-y-4">
        {messages.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Aucun message à afficher
          </p>
        ) : (
          messages.map((message) => (
            <Card
              key={message.id}
              className={
                message.isResolved
                  ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30"
                  : ""
              }
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">
                    {message.subject}
                  </CardTitle>
                  <div className="flex gap-2">
                    {!message.isResolved && (
                      <>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedMessageId(message.id)}
                            >
                              <Reply className="mr-1 size-4" /> Répondre
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Répondre au message</DialogTitle>
                              <DialogDescription>
                                Votre réponse sera envoyée à{" "}
                                {message.user.email}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="mt-4 space-y-4">
                              <div className="rounded-md bg-muted p-4 dark:bg-gray-800">
                                <h4 className="mb-2 font-medium">
                                  Message original:
                                </h4>
                                <p className="whitespace-pre-wrap text-sm">
                                  {message.message}
                                </p>
                              </div>
                              <div>
                                <h4 className="mb-2 font-medium">
                                  Votre réponse:
                                </h4>
                                <Textarea
                                  className="min-h-32"
                                  placeholder="Saisissez votre réponse ici..."
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="mark-resolved"
                                  checked={markAsResolved}
                                  onCheckedChange={(checked) =>
                                    setMarkAsResolved(checked === true)
                                  }
                                />
                                <Label htmlFor="mark-resolved">
                                  Marquer comme résolu après l'envoi
                                </Label>
                              </div>
                            </div>
                            <DialogFooter className="mt-4">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setReplyText("");
                                  setSelectedMessageId(null);
                                  setMarkAsResolved(false);
                                }}
                              >
                                Annuler
                              </Button>
                              <Button
                                onClick={() => handleReplySubmit(message.id)}
                                disabled={isSubmitting || !replyText.trim()}
                              >
                                {isSubmitting
                                  ? "Envoi..."
                                  : "Envoyer la réponse"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsResolved(message.id)}
                        >
                          Marquer comme résolu
                        </Button>
                      </>
                    )}
                    {message.isResolved && (
                      <span className="flex items-center text-sm text-green-600">
                        <CheckCircle className="mr-1 size-4" /> Résolu
                      </span>
                    )}
                  </div>
                </div>
                <CardDescription className="flex items-center justify-between">
                  <span>
                    De: {message.user.name || "Utilisateur"} (
                    {message.user.email})
                  </span>
                  <span className="flex items-center text-xs text-muted-foreground">
                    <Clock className="mr-1 size-3" />
                    {formatDate(message.createdAt)}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{message.message}</p>

                {message.responses && message.responses.length > 0 && (
                  <div className="mt-4 rounded-md bg-blue-50 p-3 dark:bg-blue-950/30">
                    <h4 className="mb-2 text-sm font-medium text-blue-700">
                      Historique de la conversation:
                    </h4>
                    <div className="space-y-3">
                      {message.responses.map((response) => (
                        <div
                          key={response.id}
                          className={`rounded-md p-2 text-sm ${
                            response.type === "admin"
                              ? "bg-white dark:bg-gray-800"
                              : "bg-green-50 dark:bg-green-950/30"
                          }`}
                        >
                          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                            <span className="font-medium">
                              {response.type === "admin"
                                ? "Réponse de: "
                                : "Message de: "}
                              {response.author}
                            </span>
                            <span>{formatDate(response.createdAt)}</span>
                          </div>
                          <div className="border-t pt-2">
                            <p className="whitespace-pre-wrap">
                              {response.response || "Aucun contenu disponible"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>

      <TabsContent value="feedbacks" className="mt-6 space-y-4">
        {feedbacks.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Aucun avis à afficher
          </p>
        ) : (
          feedbacks.map((feedback) => (
            <Card key={feedback.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-medium">
                      {renderStarRating(feedback.rating)} ({feedback.rating}/5)
                    </CardTitle>
                    <CardDescription>
                      De: {feedback.user.name || "Utilisateur"} (
                      {feedback.user.email})
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingFeedback(feedback);
                        setEditFeedbackText(feedback.feedback);
                        setEditFeedbackRating(feedback.rating);
                      }}
                    >
                      <Pencil className="mr-1 size-4" /> Modifier
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(feedback.createdAt)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">
                  {feedback.feedback}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>

      {editingFeedback && (
        <Dialog
          open={!!editingFeedback}
          onOpenChange={(open) => !open && setEditingFeedback(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier l'avis</DialogTitle>
              <DialogDescription>
                Modifier l'avis de{" "}
                {editingFeedback.user.name || "l'utilisateur"}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="rating">Note (1-5)</Label>
                <div className="mt-2 flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      type="button"
                      variant={
                        editFeedbackRating === rating ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setEditFeedbackRating(rating)}
                    >
                      {rating}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="feedback-text">Commentaire</Label>
                <Textarea
                  id="feedback-text"
                  className="mt-2 min-h-32"
                  value={editFeedbackText}
                  onChange={(e) => setEditFeedbackText(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setEditingFeedback(null)}
              >
                Annuler
              </Button>
              <Button onClick={handleEditFeedback}>
                Enregistrer les modifications
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Tabs>
  );
}
