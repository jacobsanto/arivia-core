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
  type: "in" | "out";
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
      };

      const { data, error } = await supabase
        .from("inventory")
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
      const { data, error } = await supabase
        .from("stock_movements")
        .insert({
          item_id: values.item_id,
          quantity: values.quantity,
          type: values.type,
          note: values.note ?? null,
        })
        .select("*")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    {
      successTitle: "Stock movement recorded",
      onSuccess: async () => {
        await Promise.all([
          qc.invalidateQueries({ queryKey: ["inventory-items"] }),
          qc.invalidateQueries({ queryKey: ["inventory-usage"] }),
        ]);
      },
    }
  );
}
