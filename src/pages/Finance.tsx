
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RotateCcw, Loader2, Wrench, Package, BarChart3, FileWarning } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Finance: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["finance-damage-mtd"] }),
        queryClient.invalidateQueries({ queryKey: ["finance-inventory-mtd"] }),
        queryClient.invalidateQueries({ queryKey: ["finance-properties"] }),
        queryClient.invalidateQueries({ queryKey: ["finance-damage-by-property"] }),
        queryClient.invalidateQueries({ queryKey: ["finance-inventory-by-property"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-items"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-usage"] }),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}/finance` : '/finance';

  const startOfMonthISO = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  const { data: damageStats } = useQuery({
    queryKey: ["finance-damage-mtd", startOfMonthISO],
    queryFn: async () => {
      const { data } = await supabase
        .from('damage_reports')
        .select('final_cost, estimated_cost, status, created_at')
        .gte('created_at', startOfMonthISO);
      let total = 0;
      let openCount = 0;
      (data || []).forEach((r: any) => {
        const cost = (r.final_cost ?? r.estimated_cost ?? 0) as number;
        total += cost;
        if (r.status !== 'resolved' && r.status !== 'closed') openCount++;
      });
      return { total, openCount };
    },
    refetchInterval: 30000,
  });

  const { data: invStats } = useQuery({
    queryKey: ["finance-inventory-mtd", startOfMonthISO],
    queryFn: async () => {
      const { data } = await supabase
        .from('inventory_usage')
        .select('quantity, date')
        .gte('date', startOfMonthISO);
      const totalQty = (data || []).reduce((sum: number, r: any) => sum + (r.quantity || 0), 0);
      return { totalQty, records: (data || []).length };
    },
    refetchInterval: 30000,
  });

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n || 0);

  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all');

  const { data: properties } = useQuery({
    queryKey: ["finance-properties"],
    queryFn: async () => {
      const { data } = await supabase.from('properties').select('id, name').order('name');
      return data || [];
    },
    staleTime: 60_000,
  });

  const selectedPropertyName = selectedPropertyId === 'all'
    ? null
    : (properties || []).find((p: any) => p.id === selectedPropertyId)?.name || null;

  const { data: damageByProperty } = useQuery({
    queryKey: ["finance-damage-by-property", selectedPropertyId, startOfMonthISO],
    queryFn: async () => {
      if (selectedPropertyId === 'all') return { total: 0 };
      let q = supabase
        .from('damage_reports')
        .select('final_cost, estimated_cost, property_id, created_at')
        .gte('created_at', startOfMonthISO)
        .eq('property_id', selectedPropertyId);
      const { data } = await q;
      const total = (data || []).reduce((sum: number, r: any) => sum + ((r.final_cost ?? r.estimated_cost) || 0), 0);
      return { total };
    },
    enabled: selectedPropertyId !== 'all',
    refetchInterval: 30000,
  });

  const { data: invByProperty } = useQuery({
    queryKey: ["finance-inventory-by-property", selectedPropertyName, startOfMonthISO],
    queryFn: async () => {
      if (!selectedPropertyName) return { totalQty: 0 };
      const { data } = await supabase
        .from('inventory_usage')
        .select('quantity, property, date')
        .gte('date', startOfMonthISO)
        .eq('property', selectedPropertyName);
      const totalQty = (data || []).reduce((sum: number, r: any) => sum + (r.quantity || 0), 0);
      return { totalQty };
    },
    enabled: !!selectedPropertyName,
    refetchInterval: 30000,
  });


  return (
    <>
      <Helmet>
        <title>Finance — Damage & Inventory | Arivia Villas</title>
        <meta name="description" content="Track damage repair costs and inventory spend/valuation at Arivia Villas. No revenue or payouts." />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <main className="space-y-6 p-4 md:p-6">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Finance</h1>
            <p className="text-muted-foreground">Damage repairs and inventory cost tracking</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RotateCcw className="h-4 w-4 mr-2" />
            )}
            {refreshing ? "Refreshing" : "Refresh"}
          </Button>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-md">
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                <Wrench className="h-4 w-4" /> MTD Damage Cost
              </div>
              <div className="text-2xl font-bold">{formatCurrency(damageStats?.total || 0)}</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md">
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                <FileWarning className="h-4 w-4" /> Open Damage Reports
              </div>
              <div className="text-2xl font-bold">{damageStats?.openCount || 0}</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md">
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                <Package className="h-4 w-4" /> MTD Inventory Usage (qty)
              </div>
              <div className="text-2xl font-bold">{invStats?.totalQty || 0}</div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Per‑Villa Breakdown</h2>
            <div className="w-60">
              <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select villa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Villas</SelectItem>
                  {(properties || []).map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="hover:shadow-md">
              <CardContent className="p-6">
                <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                  <Wrench className="h-4 w-4" /> Damage Cost (MTD)
                </div>
                <div className="text-2xl font-bold">{selectedPropertyId === 'all' ? '—' : formatCurrency(damageByProperty?.total || 0)}</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md">
              <CardContent className="p-6">
                <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                  <Package className="h-4 w-4" /> Inventory Usage (MTD qty)
                </div>
                <div className="text-2xl font-bold">{selectedPropertyId === 'all' ? '—' : (invByProperty?.totalQty || 0)}</div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </>
  );
};

export default Finance;
