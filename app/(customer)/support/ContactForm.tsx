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
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { sendContactMessage } from "./support.action";

const contactFormSchema = z.object({
  subject: z.string().min(1, "Le sujet est requis"),
  message: z.string().min(10, "Le message doit faire au moins 10 caractères"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export const ContactForm = () => {
  const { toast } = useToast();
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
      toast({
        title: "Message envoyé",
        description: "Nous vous répondrons dans les plus brefs délais.",
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du message.",
        variant: "destructive",
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
