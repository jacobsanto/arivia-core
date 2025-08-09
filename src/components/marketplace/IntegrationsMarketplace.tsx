
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import IntegrationCard from "./IntegrationCard";

type IntegrationConfig = {
  provider: string;
  name: string;
  description?: string | null;
  category?: string | null;
  features?: string[] | null;
};

const HIDDEN_PROVIDERS = new Set(["quickbooks"]); // ensure QuickBooks never shows up

const IntegrationsMarketplace: React.FC = () => {
  const [query, setQuery] = React.useState("");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["integration-configs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("integration_configs")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return (data || []) as IntegrationConfig[];
    },
    refetchInterval: 60_000,
  });

  const filtered = React.useMemo(() => {
    const list = (data || []).filter((cfg) => !HIDDEN_PROVIDERS.has(cfg.provider));
    if (!query) return list;
    const q = query.toLowerCase();
    return list.filter(
      (cfg) =>
        cfg.name?.toLowerCase().includes(q) ||
        cfg.provider?.toLowerCase().includes(q) ||
        cfg.description?.toLowerCase().includes(q)
    );
  }, [data, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <h3 className="text-lg font-medium">Marketplace</h3>
        <div className="sm:ml-auto w-full sm:w-72">
          <Input
            placeholder="Search connectors (e.g., Tokeet, Google Workspace)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200 text-red-700">
          <p className="font-medium">Failed to load integrations</p>
          <p className="text-sm">{error instanceof Error ? error.message : "Unknown error"}</p>
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-md" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((cfg) => (
            <IntegrationCard
              key={cfg.provider}
              provider={cfg.provider}
              name={cfg.name}
              description={cfg.description}
              category={cfg.category}
              features={Array.isArray(cfg.features) ? cfg.features : undefined}
            />
          ))}
          {filtered.length === 0 && (
            <div className="text-sm text-muted-foreground">
              No integrations found. Try a different search.
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default IntegrationsMarketplace;
