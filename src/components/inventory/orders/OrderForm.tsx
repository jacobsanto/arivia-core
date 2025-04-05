
import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import StockFormNotes from "../forms/StockFormNotes";
import StockFormSubmitButton from "../forms/StockFormSubmitButton";
import StockItemList from "../forms/StockItemList";
import OrderFormVendor from "./OrderFormVendor";

const formSchema = z.object({
  vendorId: z.string().min(1, { message: "Please select a vendor." }),
  date: z.string().min(1, { message: "Please enter a date." }),
  requestor: z.string().min(1, { message: "Please enter your name." }),
  items: z.array(
    z.object({
      itemId: z.string().min(1, { message: "Please select an item." }),
      quantity: z.coerce.number().min(1, { message: "Quantity must be at least 1." }),
    })
  ).min(1, { message: "Please add at least one item to the order." }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const OrderForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { canAccess } = usePermissions();
  const canApproveOrders = canAccess("approve_orders");

  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vendorId: "",
      date: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
      requestor: "",
      items: [{ itemId: "", quantity: 1 }],
      notes: "",
    },
  });

  function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log(values);
      
      toast({
        title: "Order Submitted",
        description: canApproveOrders 
          ? "Order has been submitted and will be sent to the vendor." 
          : "Order has been submitted for approval.",
      });
      
      methods.reset({
        vendorId: "",
        date: new Date().toISOString().split("T")[0],
        requestor: "",
        items: [{ itemId: "", quantity: 1 }],
        notes: "",
      });
      
      setIsSubmitting(false);
    }, 1000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Purchase Order</CardTitle>
      </CardHeader>
      <CardContent>
        <FormProvider {...methods}>
          <Form {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">
              <OrderFormVendor />
              
              <div className="space-y-4">
                <StockItemList title="Order Items" />
              </div>
              
              <StockFormNotes />
              
              <StockFormSubmitButton 
                label={canApproveOrders ? "Create and Send Order" : "Submit for Approval"} 
                isLoading={isSubmitting} 
              />
            </form>
          </Form>
        </FormProvider>
      </CardContent>
    </Card>
  );
};

export default OrderForm;
