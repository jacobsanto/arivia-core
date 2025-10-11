
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
import { logger } from "@/services/logger";

const formSchema = z.object({
  sourceLocation: z.string().min(1, { message: "Please select a source location." }),
  destinationLocation: z.string().min(1, { message: "Please select a destination location." }),
  date: z.string(),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      itemId: z.string().min(1, { message: "Please select an item." }),
      quantity: z.coerce.number().min(1, { message: "Quantity must be at least 1." }),
    })
  ).min(1, { message: "Please add at least one item." }),
}).refine((data) => data.sourceLocation !== data.destinationLocation, {
  message: "Source and destination locations cannot be the same",
  path: ["destinationLocation"],
});

type FormValues = z.infer<typeof formSchema>;

const StockTransfer = () => {
  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sourceLocation: "",
      destinationLocation: "",
      date: new Date().toISOString().split("T")[0],
      notes: "",
      items: [{ itemId: "", quantity: 1 }],
    },
  });
  
  const onSubmit = (values: FormValues) => {
    logger.debug('StockTransfer', 'Form values', values);
    toast({
      title: "Stock Transfer Processed",
      description: `Items have been transferred from ${values.sourceLocation} to ${values.destinationLocation}`,
    });
    methods.reset({
      sourceLocation: "",
      destinationLocation: "",
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
                <StockFormHeader 
                  showSourceLocation={true} 
                  showDestinationLocation={true} 
                />
                <StockItemList title="Items to Transfer" />
                <StockFormNotes />
                <StockFormSubmitButton label="Process Transfer" />
              </form>
            </Form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockTransfer;
