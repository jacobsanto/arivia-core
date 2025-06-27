import React, { useState } from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";

interface OrderFormProps {
  onSubmit: (values: any) => void;
  onCancel: () => void;
  initialOrder?: any;
}

const orderSchema = z.object({
  item: z.string().min(2, {
    message: "Item must be at least 2 characters.",
  }),
  quantity: z.number().min(1, {
    message: "Quantity must be at least 1.",
  }),
  unitPrice: z.number().min(0, {
    message: "Unit price must be non-negative.",
  }),
  supplier: z.string().optional(),
  notes: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

const OrderForm: React.FC<OrderFormProps> = ({ onSubmit, onCancel, initialOrder }) => {
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      item: initialOrder?.item || "",
      quantity: initialOrder?.quantity || 1,
      unitPrice: initialOrder?.unitPrice || 0,
      supplier: initialOrder?.supplier || "",
      notes: initialOrder?.notes || "",
    },
  });

  const canApprove = user?.role === "superadmin" || 
                    user?.role === "tenant_admin" || 
                    user?.role === "property_manager";

  const handleSubmit = async (values: OrderFormValues) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onSubmit(values);
      toast.success("Order submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="item"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item</FormLabel>
              <FormControl>
                <Input placeholder="Item name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Quantity"
                  {...field}
                  onChange={(e) =>
                    field.onChange(Number(e.target.value))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="unitPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit Price</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Unit Price"
                  {...field}
                  onChange={(e) =>
                    field.onChange(Number(e.target.value))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="supplier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supplier (optional)</FormLabel>
              <FormControl>
                <Input placeholder="Supplier" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optional)</FormLabel>
              <FormControl>
                <Input placeholder="Notes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Order"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default OrderForm;
