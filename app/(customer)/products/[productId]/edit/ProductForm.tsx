"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  GRADIENTS_CLASSES,
  ProductSchema,
  ProductType,
} from "./product.schema";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, useZodForm } from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { createProductAction, updateProductAction } from "./product.action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export type ProductFormProps = {
  defaultValues?: ProductType;
  productId?: string;
};

export const ProductForm = (props: ProductFormProps) => {
  const form = useZodForm({
    schema: ProductSchema,
    defaultValues: props.defaultValues,
  });
  const isCreate = !Boolean(props.defaultValues);
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (values: ProductType) => {
      const { data, serverError } = isCreate 
      ? await createProductAction(values) : 
      await updateProductAction({
        id: props.productId ?? "-",
        data: values,
      });

      if (serverError || !data) {
        throw new Error(serverError);
        return;
      }

      toast.success("Product created");
      router.push(`/products/${data.id}`);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isCreate
            ? "Create product"
            : `Edit product ${props.defaultValues?.name}`}
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
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                    <Input placeholder="Sceance avec patoche" {...field} />
                </FormControl>
                <FormDescription>
                  The name of the product ro review
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image</FormLabel>
                <FormControl>
                    <Input type="file" placeholder="Sceance avec patoche" onChange={e => {
                      const file = e.target.files?.[0];

                      if (!file) {
                        return;
                      }

                      if (file.size > 1024 * 1024) {
                        toast.error("File is too big");
                        return;
                      }

                      if (!file.type.includes("image")) {
                        toast.error("File is not an image");
                        return;
                      }
                    }} />
                </FormControl>
                <FormDescription>
                  The name of the product ro review
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                    <Input 
                      placeholder="Sceance avec patoche" 
                      {...field} 
                      onChange={(e) => {
                        const value = e.target.value
                        .replaceAll(" ", "-")
                        .toLowerCase();

                        field.onChange(value);
                      }} />
                </FormControl>
                <FormDescription>
                  The slug is used in the URL of the review page
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* <FormField
            control={form.control}
            name="backgroundColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Backgound Color</FormLabel>
                <FormControl>
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue></SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {GRADIENTS_CLASSES.map((gradient) => (
                        <SelectItem 
                          value={gradient} 
                          key={gradient}
                          className="flex"
                        >
                          <div
                            className={cn(
                              gradient,
                              "block w-80 h-8 flex-1 rounded-md"
                            )}
                          ></div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input placeholder="Background color" {...field} value={field.value || ''} />
                </FormControl>
                <FormDescription>
                  The review page background color
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          /> */}
          <Button>{isCreate ? "Create product" : "Save product"}</Button>
        </Form>
      </CardContent>
    </Card>
  );
};
