import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { InputField, FormErrorSummary, SubmitButton, TextAreaField } from "@/components/form/FormKit";
import { useUpsertInventoryItem } from "@/hooks/mutations/useInventoryMutations";
import { useToast } from "@/hooks/use-toast";

const InventoryItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().optional(),
  quantity: z.coerce.number().int().min(0, "Quantity cannot be negative"),
  unit: z.string().optional(),
  notes: z.string().optional(),
});

export type InventoryItemFormValues = z.infer<typeof InventoryItemSchema>;

export interface InventoryItemFormProps {
  defaultValues?: Partial<InventoryItemFormValues> & { id?: string };
  onSuccess?: (item: any) => void;
}

export function InventoryItemForm({ defaultValues, onSuccess }: InventoryItemFormProps) {
  const form = useForm<InventoryItemFormValues>({
    resolver: zodResolver(InventoryItemSchema),
    defaultValues: {
      name: "",
      sku: "",
      quantity: 0,
      unit: "",
      notes: "",
      ...defaultValues,
    },
  });

  const { toast } = useToast();
  const upsertItem = useUpsertInventoryItem();

  const handleSubmit = async (values: InventoryItemFormValues) => {
    const res = await upsertItem.mutateAsync({
      id: (defaultValues as any)?.id,
      name: values.name,
      sku: values.sku || null,
      quantity: values.quantity,
      unit: values.unit || null,
    });
    toast({ title: "Inventory saved", description: values.name });
    onSuccess?.(res);
  };

  const { errors } = form.formState;

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <FormErrorSummary errors={errors} />

      <InputField label="Name" required {...form.register("name")} />
      <InputField label="SKU" {...form.register("sku")} />
      <InputField type="number" label="Quantity" required {...form.register("quantity", { valueAsNumber: true })} />
      <InputField label="Unit" {...form.register("unit")} />
      <TextAreaField label="Notes" rows={3} {...form.register("notes")} />

      <div className="pt-2">
        <SubmitButton isLoading={upsertItem.isPending}>Save Item</SubmitButton>
      </div>
    </form>
  );
}

export default InventoryItemForm;
