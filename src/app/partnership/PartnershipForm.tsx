"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useZodForm,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { submitPartnershipAction } from "./partnership.action";

// Schéma de validation du formulaire
const partnershipFormSchema = z.object({
  companyName: z.string().min(2, "Le nom de l'entreprise est requis"),
  contactName: z.string().min(2, "Le nom du contact est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  description: z
    .string()
    .min(
      10,
      "Veuillez décrire votre projet de partenariat (10 caractères minimum)"
    ),
});

type PartnershipFormValues = z.infer<typeof partnershipFormSchema>;

export default function PartnershipForm() {
  const router = useRouter();

  // Initialiser le formulaire avec le schéma de validation
  const form = useZodForm({
    schema: partnershipFormSchema,
    defaultValues: {
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      description: "",
    },
  });

  // Gestion de l'envoi du formulaire avec React Query
  const mutation = useMutation({
    mutationFn: async (values: PartnershipFormValues) => {
      const response = await submitPartnershipAction(values);
      return response.data;
    },
    onSuccess: (response) => {
      if (response) {
        toast.success(
          response.message ||
            "Votre demande de partenariat a été envoyée avec succès"
        );
        form.reset();
        // Rediriger vers la page d'accueil après soumission
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        toast.error("Une erreur est survenue. Veuillez réessayer.");
      }
    },
    onError: (error: any) => {
      toast.error(
        error.message || "Une erreur est survenue. Veuillez réessayer."
      );
    },
  });

  const onSubmit = (values: PartnershipFormValues) => {
    mutation.mutate(values);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground">
          Contactez-nous pour devenir partenaire
        </h3>
        <p className="mt-2 text-muted-foreground">
          Tous les champs marqués d'un * sont obligatoires
        </p>
      </div>

      <Form form={form} onSubmit={onSubmit}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de l'entreprise *</FormLabel>
                <FormControl>
                  <Input placeholder="Votre entreprise" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom du contact *</FormLabel>
                <FormControl>
                  <Input placeholder="Votre nom" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="votre@email.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone</FormLabel>
                  <FormControl>
                    <Input placeholder="Optionnel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description du partenariat souhaité *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Décrivez votre projet ou vos attentes concernant ce partenariat..."
                    className="h-32 resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader className="mr-2 size-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              "Envoyer ma demande"
            )}
          </Button>
        </div>
      </Form>
    </div>
  );
}
