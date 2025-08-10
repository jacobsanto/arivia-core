
import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { useUser } from "@/contexts/UserContext";
import { useOrders } from "@/contexts/OrderContext";
import StockFormNotes from "../forms/StockFormNotes";
import StockFormSubmitButton from "../forms/StockFormSubmitButton";
import OrderItemList from "./OrderItemList";
import OrderFormVendor from "./OrderFormVendor";
import { OrderStatus } from "./OrderUtils";
import { Checkbox } from "@/components/ui/checkbox";
import { orderService } from "@/services/order.service";

const formSchema = z.object({
  vendorId: z.string().min(1, { message: "Please select a vendor." }),
  date: z.string().min(1, { message: "Please enter a date." }),
  requestor: z.string().min(1, { message: "Please enter your name." }),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  department: z.enum(["housekeeping", "maintenance", "general"]).default("general"),
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
  const { user } = useUser();
  const { addOrder } = useOrders();
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  
  // Check if user can create orders
  const canInitiateOrders = ["housekeeping_staff", "maintenance_staff"].includes(user?.role || "");
  const canCreateOrders = ["superadmin", "administrator", "property_manager", "housekeeping_staff", "maintenance_staff"].includes(user?.role || "");
  const canApproveOrders = ["superadmin", "administrator", "property_manager"].includes(user?.role || "");

  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vendorId: "",
      date: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
      requestor: user?.name || "",
      priority: "medium",
      department: user?.role === "housekeeping_staff" ? "housekeeping" : user?.role === "maintenance_staff" ? "maintenance" : "general",
      items: [{ itemId: "", quantity: 1 }],
      notes: "",
    },
  });

  // Watch for vendor changes
  useEffect(() => {
    const subscription = methods.watch((value, { name }) => {
      if (name === 'vendorId' && value.vendorId) {
        setSelectedVendorId(value.vendorId);
        
        // Reset the items when vendor changes
        methods.setValue("items", [{ itemId: "", quantity: 1 }]);
      }
    });
    return () => subscription.unsubscribe();
  }, [methods]);

  async function onSubmit(values: FormValues) {
    if (!canCreateOrders) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to create orders.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Get item names for display
    const itemsWithNames = await Promise.all(values.items.map(async item => {
      const vendorItems = await orderService.getItemsByVendor(values.vendorId);
      const foundItem = vendorItems.find(vendorItem => vendorItem.id === item.itemId);
      return {
        ...item,
        name: foundItem?.name || "Unknown Item"
      };
    }));
    
    // Create order object
    const orderData = {
      ...values,
      items: itemsWithNames,
      requesterRole: user?.role || "",
    };
    
    // Add the order to the context
    const orderId = addOrder(orderData);
    
    // Determine the initial status based on user role
    let status: OrderStatus = "pending";
    let nextAction = "";
    
    if (user?.role === "superadmin" || user?.role === "administrator") {
      status = "approved";
      nextAction = "The order will be sent to vendors.";
    } else if (user?.role === "property_manager") {
      status = "manager_approved";
      nextAction = "The order has been approved and sent to admin for final approval.";
    } else {
      status = "pending";
      nextAction = "The order has been submitted to your manager for approval.";
    }
    
    // Show success message
    toast({
      title: "Order Submitted",
      description: `Order ${orderId} created. ${nextAction}`,
    });
    
    // Reset form
    methods.reset({
      vendorId: "",
      date: new Date().toISOString().split("T")[0],
      requestor: user?.name || "",
      priority: "medium",
      department: user?.role === "housekeeping_staff" ? "housekeeping" : user?.role === "maintenance_staff" ? "maintenance" : "general",
      items: [{ itemId: "", quantity: 1 }],
      notes: "",
    });
    
    setSelectedVendorId(null);
    setIsSubmitting(false);
  }

  if (!canCreateOrders) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Creation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">You don't have permission to create orders.</p>
          </div>
        </CardContent>
      </Card>
    );
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
              <OrderFormVendor selectedVendorId={selectedVendorId} setSelectedVendorId={setSelectedVendorId} />
              
              <div className="space-y-4">
                <OrderItemList 
                  title="Order Items" 
                  selectedVendorId={selectedVendorId} 
                />
              </div>
              
              <StockFormNotes />
              
              <StockFormSubmitButton 
                label="Submit Order Request" 
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
