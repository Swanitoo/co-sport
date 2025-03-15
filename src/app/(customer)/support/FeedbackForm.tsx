"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { sendFeedback } from "./support.action";

const feedbackFormSchema = z.object({
  rating: z.number().min(1).max(5),
  feedback: z.string().min(10, "Le feedback doit faire au moins 10 caractères"),
});

type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

export const FeedbackForm = () => {
  const [hasSubmittedFeedback, setHasSubmittedFeedback] = useState(false);
  const [userFeedback, setUserFeedback] = useState<{
    rating: number;
    feedback: string;
  } | null>(null);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      rating: 5,
      feedback: "",
    },
  });

  // Vérifier si l'utilisateur a déjà laissé un avis
  useEffect(() => {
    const checkExistingFeedback = async () => {
      try {
        const response = await fetch("/api/user/feedback");
        if (response.ok) {
          const data = await response.json();
          if (data && data.feedback) {
            setHasSubmittedFeedback(true);
            setUserFeedback(data.feedback);
          }
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du feedback:", error);
      }
    };

    checkExistingFeedback();
  }, []);

  const onSubmit = async (data: FeedbackFormValues) => {
    try {
      await sendFeedback(data);
      toast.success("Feedback envoyé", {
        description: "Merci pour votre retour !",
      });
      form.reset();
      setHasSubmittedFeedback(true);
      setUserFeedback(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Une erreur est survenue";

      if (errorMessage.includes("déjà laissé un avis")) {
        toast.error("Vous avez déjà laissé un avis", {
          description: "Un seul avis par utilisateur est autorisé.",
        });
        setHasSubmittedFeedback(true);
      } else {
        toast.error("Une erreur est survenue lors de l'envoi du feedback.", {
          description: "Veuillez réessayer plus tard ou contacter le support.",
        });
      }
    }
  };

  // Afficher le feedback existant si l'utilisateur en a déjà laissé un
  if (hasSubmittedFeedback && userFeedback) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
          <h3 className="mb-2 font-medium">Votre avis a été enregistré</h3>
          <div className="mb-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Star
                  key={rating}
                  className={`size-5 ${
                    rating <= userFeedback.rating
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {userFeedback.feedback}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Un seul avis par utilisateur est autorisé. Merci de votre
            contribution !
          </p>
        </div>
      </div>
    );
  }

  return (
    <Form form={form} onSubmit={onSubmit}>
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      className={`text-2xl transition-colors ${
                        rating <= field.value
                          ? "text-yellow-500"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => field.onChange(rating)}
                    >
                      <Star
                        className={`size-8 ${
                          rating <= field.value ? "fill-current" : ""
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="feedback"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Votre feedback</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Partagez votre expérience avec Co-Sport..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Envoyer
        </Button>
      </div>
    </Form>
  );
};
