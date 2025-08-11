import { useAppQuery } from "@/hooks/query";

export function useUsersList(searchTerm: string, filterRole: string) {
  return useAppQuery(
    ["users-list", searchTerm, filterRole],
    async () => {
      // Placeholder: integrate with Supabase "profiles" when available
      return [] as Array<any>;
    },
    { errorTitle: "Failed to load users" }
  );
}
