import { inventoryService } from "@/services/inventory.service";
import { useAppQuery } from "@/hooks/query";

export function useInventoryUsage() {
  return useAppQuery(
    ["inventory-usage"],
    () => inventoryService.getInventoryUsageHistory(),
    {
      errorTitle: "Failed to load inventory usage",
      refetchInterval: 30_000,
    }
  );
}
