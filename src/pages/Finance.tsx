
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw, Loader2, DollarSign, PieChart, Receipt } from "lucide-react";

const Finance: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["finance-expenses"] }),
        queryClient.invalidateQueries({ queryKey: ["finance-revenue"] }),
        queryClient.invalidateQueries({ queryKey: ["finance-payouts"] }),
        queryClient.invalidateQueries({ queryKey: ["finance-reports"] }),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}/finance` : '/finance';

  return (
    <>
      <Helmet>
        <title>Finance | Arivia Villas</title>
        <meta name="description" content="Finance dashboard for expenses, revenue, payouts, and per‑villa profitability at Arivia Villas." />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <main className="space-y-6 p-4 md:p-6">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Finance</h1>
            <p className="text-muted-foreground">Expenses, revenue, payouts and profitability overview</p>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5" /> Expenses Snapshot</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Coming soon: expense categories, trends and approvals.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" /> Revenue & Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Coming soon: channel revenue, payouts and reconciliation.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><PieChart className="h-5 w-5" /> Per‑Villa Profitability</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Coming soon: per‑villa P&L with filters and exports.</p>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
};

export default Finance;
