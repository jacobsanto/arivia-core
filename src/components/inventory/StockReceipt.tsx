
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import StockFormHeader from "./forms/StockFormHeader";
import StockItemList from "./forms/StockItemList";
import StockFormNotes from "./forms/StockFormNotes";
import StockFormSubmitButton from "./forms/StockFormSubmitButton";

const formSchema = z.object({
  location: z.string().min(1, { message: "Please select a location." }),
  reference: z.string().optional(),
  date: z.string(),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      itemId: z.string().min(1, { message: "Please select an item." }),
      quantity: z.coerce.number().min(1, { message: "Quantity must be at least 1." }),
    })
  ).min(1, { message: "Please add at least one item." }),
});

type FormValues = z.infer<typeof formSchema>;

const StockReceipt = () => {
  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
      reference: "",
      date: new Date().toISOString().split("T")[0],
      notes: "",
      items: [{ itemId: "", quantity: 1 }],
    },
  });

  const onSubmit = (values: FormValues) => {
    console.log(values);
    toast({
      title: "Stock Receipt Processed",
      description: `Items have been added to ${
        values.location === "main" ? "Main Storage" : values.location
      }`,
    });
    methods.reset({
      location: "",
      reference: "",
      date: new Date().toISOString().split("T")[0],
      notes: "",
      items: [{ itemId: "", quantity: 1 }],
    });
  };

  return (
    <div>
      <Card>
        <CardContent className="pt-6">
          <FormProvider {...methods}>
            <Form {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
                <StockFormHeader showLocation={true} />
                <StockItemList title="Items Received" />
                <StockFormNotes />
                <StockFormSubmitButton label="Process Receipt" />
              </form>
            </Form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockReceipt;
