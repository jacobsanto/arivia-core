
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Wrench className="h-5 w-5" /> Damage Repair Costs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Track repair estimates, approved costs, and pending invoices from damage reports.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" /> Inventory Spend & Stock Valuation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Monitor purchase spend, unit costs, and current stock valuation.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Damage vs Inventory Cost Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Compare monthly damage costs vs. inventory usage costs.</p>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
};

export default Finance;
