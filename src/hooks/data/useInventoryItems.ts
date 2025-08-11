import { inventoryService } from "@/services/inventory.service";
import { useAppQuery } from "@/hooks/query";

export function useInventoryItems() {
  return useAppQuery(
    ["inventory-items"],
    () => inventoryService.getItems(),
    {
      errorTitle: "Failed to load items",
      refetchInterval: 30_000,
    }
  );
}
