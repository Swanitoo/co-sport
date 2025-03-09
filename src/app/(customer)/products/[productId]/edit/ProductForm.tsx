"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
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

export const ProductForm = (props: ProductFormProps) => {
  const router = useRouter();
  const isCreate = !props.defaultValues;

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
    },
    onSuccess: ({ data, serverError }) => {
      if (serverError) {
        console.error("Erreur serveur", serverError);
        toast.error(serverError);
        return;
      }

      if (data) {
        toast.success(
          isCreate
            ? "Annonce créée avec succès"
            : "Annonce modifiée avec succès"
        );
        router.push(`/products/${data.id}`);
        router.refresh();
      } else {
        console.error("Pas de données reçues du serveur");
        toast.error("Une erreur est survenue");
      }
    },
  });

  const onSubmit = async (values: ProductType) => {
    try {
      await mutation.mutateAsync(values);
    } catch (error) {
      console.error("Erreur lors de la soumission", error);
      toast.error("Une erreur est survenue lors de la création du groupe");
    }
  };

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
                        <FormLabel className="text-base">Only Girls</FormLabel>
                        <FormDescription>
                          Réserver cette annonce uniquement aux femmes
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

          <Button disabled={mutation.isPending} type="submit">
            {mutation.isPending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                <span>
                  {isCreate
                    ? "Création en cours..."
                    : "Modification en cours..."}
                </span>
              </div>
            ) : isCreate ? (
              "Créer ton annonce"
            ) : (
              "Enregistrer les modifications"
            )}
          </Button>
        </Form>
      </CardContent>
    </Card>
  );
};
