
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import ItemFormDetails from "./forms/ItemFormDetails";
import StockFormNotes from "./forms/StockFormNotes";
import StockFormSubmitButton from "./forms/StockFormSubmitButton";
import { useInventory } from "@/contexts/InventoryContext";

const formSchema = z.object({
  name: z.string().min(2, { message: "Item name must be at least 2 characters." }),
  category: z.string().min(1, { message: "Please select a category." }),
  unit: z.string().min(1, { message: "Please select a unit." }),
  minLevel: z.coerce.number().min(0, { message: "Minimum level must be 0 or higher." }),
  initialStock: z.coerce.number().min(0, { message: "Initial stock must be 0 or higher." }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AddItem = () => {
  // Use the shared inventory context
  const { categories, units } = useInventory();

  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      unit: "",
      minLevel: 10,
      initialStock: 0,
      notes: "",
    },
  });

  function onSubmit(values: FormValues) {
    console.log(values);
    toast({
      title: "Item Added Successfully",
      description: `${values.name} has been added to inventory.`,
    });
    methods.reset();
  }

  return (
    <div>
      <Card>
        <CardContent className="pt-6">
          <FormProvider {...methods}>
            <Form {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">
                <ItemFormDetails categories={categories} units={units} />
                <StockFormNotes />
                <StockFormSubmitButton label="Add Item" />
              </form>
            </Form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddItem;
