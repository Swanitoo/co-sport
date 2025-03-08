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
  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      rating: 5,
      feedback: "",
    },
  });

  const onSubmit = async (data: FeedbackFormValues) => {
    try {
      await sendFeedback(data);
      toast.success("Feedback envoyé", {
        description: "Merci pour votre retour !",
      });
      form.reset();
    } catch (error) {
      toast.error("Une erreur est survenue lors de l'envoi du feedback.", {
        description: "Veuillez réessayer plus tard ou contacter le support.",
      });
    }
  };

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
