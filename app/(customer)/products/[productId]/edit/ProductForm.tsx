"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SportVenueSearch } from "../SportVenueSearch";
import { createProductAction, updateProductAction } from "./product.action";
import {
  LEVEL_CLASSES,
  ProductSchema,
  ProductType,
  SPORT_CLASSES,
} from "./product.schema";

export type ProductFormProps = {
  defaultValues?: ProductType;
  productId?: string;
  userSex?: string | null;
};

export const ProductForm = (props: ProductFormProps) => {
  const transformedValues = props.defaultValues
    ? {
        ...props.defaultValues,
        onlyGirls: props.defaultValues.onlyGirls ?? false,
        venueName: props.defaultValues.venueName ?? undefined,
        venueAddress: props.defaultValues.venueAddress ?? undefined,
        venueLat: props.defaultValues.venueLat ?? undefined,
        venueLng: props.defaultValues.venueLng ?? undefined,
      }
    : undefined;

  const form = useZodForm({
    schema: ProductSchema,
    defaultValues: transformedValues,
  });
  const isCreate = !Boolean(props.defaultValues);
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (values: ProductType) => {
      const { data, serverError } = isCreate
        ? await createProductAction(values)
        : await updateProductAction({
            id: props.productId ?? "-",
            data: values,
          });

      if (serverError || !data) {
        toast.error(serverError);
        return;
      }

      router.push(`/products/${data.id}`);
      router.refresh();
    },
  });
  console.log("User sex:", props.userSex);
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
        <Form
          className="flex flex-col gap-4"
          form={form}
          onSubmit={async (values) => {
            await mutation.mutateAsync(values);
          }}
        >
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
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue></SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {SPORT_CLASSES.map((sport) => (
                            <SelectItem
                              value={sport}
                              key={sport}
                              className="flex"
                            >
                              <div>
                                <span>{sport}</span>
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
                          form.setValue("venueLat", venue.lat);
                          form.setValue("venueLng", venue.lng);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
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
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue></SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {LEVEL_CLASSES.map((level) => (
                            <SelectItem
                              value={level}
                              key={level}
                              className="flex"
                            >
                              <div>
                                <span>{level}</span>
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
                    <FormItem>
                      <FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          onClick={() => field.onChange(!field.value)}
                          className={cn(
                            "w-full font-medium border-pink-300 transition-all duration-200",
                            field.value
                              ? "bg-pink-100 text-pink-900 hover:bg-pink-200 border-pink-500"
                              : "text-pink-700 hover:bg-pink-50 hover:text-pink-900 hover:border-pink-500"
                          )}
                        >
                          👩 Only Girls
                        </Button>
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </TabsContent>
          </Tabs>

          <Button disabled={mutation.isPending}>
            {mutation.isPending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                <span>Création en cours...</span>
              </div>
            ) : (
              isCreate ? "Créer ton annonce" : "Enregistre ton annonce"
            )}
          </Button>
        </Form>
      </CardContent>
    </Card>
  );
};
