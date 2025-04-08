"use client";

import { useAppTranslations } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Confetti } from "@/components/ui/confetti";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useZodForm,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useMutation } from "@tanstack/react-query";
import { Loader2, SaveIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LocationPreviewMap } from "../LocationPreviewMap";
import { SportVenueSearch } from "../SportVenueSearch";
import { createProductAction, updateProductAction } from "./product.action";
import {
  LEVEL_CLASSES,
  ProductSchema,
  ProductType,
  SPORTS,
} from "./product.schema";

export type ProductFormProps = {
  defaultValues?: ProductType;
  productId?: string;
  userSex?: string | null;
};

export const ProductForm: React.FC<ProductFormProps> = (props) => {
  const { t, locale } = useAppTranslations();
  const router = useRouter();
  const isCreate = !props.defaultValues;
  const [submitClicked, setSubmitClicked] = useState(false);
  const [formReady, setFormReady] = useState(false);

  // S'assurer que le formulaire est considéré comme prêt seulement après le premier rendu
  useEffect(() => {
    setFormReady(true);
  }, []);

  const form = useZodForm({
    schema: ProductSchema,
    defaultValues: {
      name: props.defaultValues?.name ?? "",
      description: props.defaultValues?.description ?? "",
      sport: props.defaultValues?.sport ?? "",
      level: props.defaultValues?.level ?? "",
      venueName: props.defaultValues?.venueName ?? "",
      venueAddress: props.defaultValues?.venueAddress ?? "",
      venueLatitude: props.defaultValues?.venueLatitude ?? undefined,
      venueLongitude: props.defaultValues?.venueLongitude ?? undefined,
      onlyGirls: props.defaultValues?.onlyGirls ?? false,
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: ProductType) => {
      if (isCreate) {
        return createProductAction(values);
      }
      return updateProductAction({
        id: props.productId!,
        data: values,
      });
    },
    onError: (error) => {
      console.error("Erreur lors de la mutation", error);
      toast.error("Une erreur est survenue lors de la création du groupe");
      setSubmitClicked(false);
    },
    onSuccess: ({ data, serverError }) => {
      if (serverError) {
        console.error("Erreur serveur", serverError);
        toast.error(serverError);
        setSubmitClicked(false);
        return;
      }

      if (data) {
        // Afficher le toast de succès
        toast.success(
          isCreate
            ? t("Products.CreateSuccess", "Annonce créée avec succès")
            : t("Products.UpdateSuccess", "Annonce modifiée avec succès")
        );

        // Rediriger immédiatement, la page de destination affichera un skeleton
        router.push(`/${locale}/products/${data.slug}`);
        router.refresh();
      } else {
        console.error("Pas de données reçues du serveur");
        toast.error(t("Products.Error", "Une erreur est survenue"));
        setSubmitClicked(false);
      }
    },
  });

  const onSubmit = async (values: ProductType) => {
    try {
      // Seulement quand l'utilisateur clique sur soumettre
      setSubmitClicked(true);

      // Commencer la mutation
      mutation.mutateAsync(values);
    } catch (error) {
      console.error("Erreur lors de la soumission", error);
      toast.error("Une erreur est survenue lors de la création du groupe");
      setSubmitClicked(false);
    }
  };

  // Afficher le formulaire seulement quand il est prêt
  if (!formReady) {
    return null; // Ou un loader minimal pendant le chargement du formulaire
  }

  // Si l'utilisateur a cliqué sur soumettre, afficher l'écran de redirection
  if (submitClicked) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <Loader2 className="size-5 animate-spin" />
            {isCreate
              ? "Création de l'annonce en cours..."
              : "Mise à jour de l'annonce en cours..."}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="mb-4 text-center text-muted-foreground">
            <p>Nous préparons votre annonce...</p>
            <p className="mt-2 text-sm">
              Vous allez être redirigé vers la page de votre annonce.
            </p>
          </div>
          <Loader2 className="size-10 animate-spin text-primary" />
          {/* Ajout de l'animation de confettis lors de la création */}
          {isCreate && <Confetti trigger={true} type="celebration" />}
          {/* Animation plus discrète pour la mise à jour */}
          {!isCreate && <Confetti trigger={true} type="success" />}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isCreate
            ? "Nouvelle annonce"
            : `Modification ${props.defaultValues?.name}`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form className="flex flex-col gap-4" form={form} onSubmit={onSubmit}>
          <Tabs defaultValue="general">
            <TabsContent className="flex flex-col gap-6" value="general">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Randonnée de 30km" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sport</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un sport" />
                        </SelectTrigger>
                        <SelectContent>
                          {SPORTS.map((sport) => (
                            <SelectItem key={sport.name} value={sport.name}>
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{sport.icon}</span>
                                <span>{sport.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="venueName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lieu de l'activité</FormLabel>
                    <FormControl>
                      <SportVenueSearch
                        defaultValue={field.value}
                        onSelect={(venue) => {
                          form.setValue("venueName", venue.name);
                          form.setValue("venueAddress", venue.address);
                          form.setValue("venueLatitude", venue.lat);
                          form.setValue("venueLongitude", venue.lng);
                        }}
                      />
                    </FormControl>
                    <FormMessage />

                    {/* Afficher la mini-carte uniquement lorsqu'un lieu a été sélectionné */}
                    {form.watch("venueLatitude") &&
                      form.watch("venueLongitude") && (
                        <div className="mt-2">
                          <LocationPreviewMap
                            latitude={form.watch("venueLatitude")}
                            longitude={form.watch("venueLongitude")}
                            venueName={form.watch("venueName")}
                            venueAddress={form.watch("venueAddress")}
                          />
                        </div>
                      )}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niveau</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un niveau" />
                        </SelectTrigger>
                        <SelectContent>
                          {LEVEL_CLASSES.map((level) => (
                            <SelectItem key={level.name} value={level.name}>
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{level.icon}</span>
                                <span>{level.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Randonnée de 30 km dans les Alpes..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {props.userSex === "F" && (
                <FormField
                  control={form.control}
                  name="onlyGirls"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Pour femmes uniquement</FormLabel>
                        <FormDescription>
                          Autorise uniquement les femmes à rejoindre ce groupe
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </TabsContent>
          </Tabs>

          <CardFooter className="flex justify-end gap-2 px-0 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={mutation.isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!form.formState.isValid || mutation.isPending}
              className="relative min-w-32"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {isCreate ? "Création..." : "Mise à jour..."}
                </>
              ) : (
                <>
                  <SaveIcon className="mr-2 size-4" />
                  {isCreate ? "Créer l'annonce" : "Mettre à jour"}
                </>
              )}
            </Button>
          </CardFooter>
        </Form>
      </CardContent>
    </Card>
  );
};
