import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { InputField, TextAreaField, FormErrorSummary, SubmitButton } from "@/components/form/FormKit";
import { useCreateStockMovement } from "@/hooks/mutations/useInventoryMutations";
import { useToast } from "@/hooks/use-toast";

const StockMovementSchema = z.object({
  item_id: z.string().min(1, "Item ID is required"),
  quantity: z.coerce.number().int().positive("Quantity must be positive"),
  type: z.enum(["in", "out"]),
  note: z.string().optional(),
});

export type StockMovementFormValues = z.infer<typeof StockMovementSchema>;

export interface StockMovementFormProps {
  defaultValues?: Partial<StockMovementFormValues>;
  onSuccess?: (movement: any) => void;
}

export function StockMovementForm({ defaultValues, onSuccess }: StockMovementFormProps) {
  const form = useForm<StockMovementFormValues>({
    resolver: zodResolver(StockMovementSchema),
    defaultValues: {
      item_id: "",
      quantity: 1,
      type: "in",
      note: "",
      ...defaultValues,
    },
  });

  const { toast } = useToast();
  const createMovement = useCreateStockMovement();

  const handleSubmit = async (values: StockMovementFormValues) => {
    const res = await createMovement.mutateAsync(values);
    toast({ title: "Stock movement recorded" });
    onSuccess?.(res);
  };

  const { errors } = form.formState;

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <FormErrorSummary errors={errors} />

      <InputField label="Item ID" required {...form.register("item_id")} />
      <InputField type="number" label="Quantity" required {...form.register("quantity", { valueAsNumber: true })} />
      <InputField label="Type (in/out)" required {...form.register("type")} />
      <TextAreaField label="Note" rows={3} {...form.register("note")} />

      <div className="pt-2">
        <SubmitButton isLoading={createMovement.isPending}>Record Movement</SubmitButton>
      </div>
    </form>
  );
}

export default StockMovementForm;
