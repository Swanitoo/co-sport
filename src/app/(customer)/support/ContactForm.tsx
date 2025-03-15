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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { sendContactMessage } from "./support.action";
import { useTickets } from "./TicketsContext";

const contactFormSchema = z.object({
  subject: z.string().min(1, "Le sujet est requis"),
  message: z.string().min(10, "Le message doit faire au moins 10 caractères"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export const ContactForm = () => {
  const { addTicket } = useTickets();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    try {
      await sendContactMessage(data);

      // Créer un nouveau ticket temporaire pour l'affichage immédiat
      const newTicket = {
        id: `temp-${Date.now()}`,
        subject: data.subject,
        message: data.message,
        createdAt: new Date().toISOString(),
        isResolved: false,
        responses: [],
      };

      // Ajouter le ticket à l'état local
      addTicket(newTicket);

      toast.success("Message envoyé", {
        description: "Nous vous répondrons dans les plus brefs délais.",
      });
      form.reset();
    } catch (error) {
      toast.error("Une erreur est survenue lors de l'envoi du message.", {
        description: "Veuillez réessayer plus tard.",
      });
    }
  };

  return (
    <Form form={form} onSubmit={onSubmit}>
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sujet</FormLabel>
              <FormControl>
                <Input placeholder="Votre sujet" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Votre message"
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
