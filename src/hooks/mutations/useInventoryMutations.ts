import { useAppMutation } from "@/hooks/query/useAppMutation";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type UpsertInventoryItemInput = {
  id?: string;
  name: string;
  sku?: string | null;
  quantity: number;
  unit?: string | null;
};

export type CreateStockMovementInput = {
  item_id: string;
  quantity: number;
  type: "in" | "out"; // accepted by form, not stored directly
  note?: string | null;
};

export function useUpsertInventoryItem() {
  const qc = useQueryClient();

  return useAppMutation<any, Error, UpsertInventoryItemInput, unknown>(
    async (values) => {
      const payload = {
        id: values.id,
        name: values.name,
        sku: values.sku ?? null,
        quantity: values.quantity,
        unit: values.unit ?? null,
      } as any;

      const { data, error } = await supabase
        .from("inventory_items")
        .upsert(payload, { onConflict: "id" })
        .select("*")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    {
      successTitle: "Inventory saved",
      onSuccess: async () => {
        await Promise.all([
          qc.invalidateQueries({ queryKey: ["inventory-items"] }),
          qc.invalidateQueries({ queryKey: ["inventory"] }),
        ]);
      },
    }
  );
}

export function useCreateStockMovement() {
  const qc = useQueryClient();

  return useAppMutation<any, Error, CreateStockMovementInput, unknown>(
    async (values) => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id;
      if (!userId) throw new Error("Not authenticated");

      // TODO: Create inventory_usage table or stock_movements table
      // For now, just update the inventory_items quantity directly
      const { data: item } = await supabase
        .from("inventory_items")
        .select('quantity')
        .eq('id', values.item_id)
        .single();

      if (!item) throw new Error("Item not found");

      const newQuantity = values.type === 'in' 
        ? item.quantity + values.quantity 
        : item.quantity - values.quantity;

      const { data, error } = await supabase
        .from("inventory_items")
        .update({ quantity: newQuantity })
        .eq('id', values.item_id)
        .select("*")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    {
      successTitle: "Stock movement recorded",
      onSuccess: async () => {
        await qc.invalidateQueries({ queryKey: ["inventory-items"] });
      },
    }
  );
}
