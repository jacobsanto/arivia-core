
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RotateCcw, Loader2, Wrench, Package, BarChart3, FileWarning, ArrowUpDown, Download, ChevronLeft, ChevronRight } from "lucide-react";
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
  const { data: dmgAll = [] } = useQuery({
    queryKey: ["finance-damage-mtd-all", startOfMonthISO],
    queryFn: async () => {
      const { data } = await supabase
        .from('damage_reports')
        .select('property_id, final_cost, estimated_cost, created_at')
        .gte('created_at', startOfMonthISO);
      return data || [];
    },
    refetchInterval: 30000,
  });

  const damageTotalsById = React.useMemo(() => {
    const map: Record<string, number> = {};
    (dmgAll as any[]).forEach((r: any) => {
      const id = r.property_id as string | null;
      if (!id) return;
      const cost = (r.final_cost ?? r.estimated_cost ?? 0) as number;
      map[id] = (map[id] || 0) + cost;
    });
    return map;
  }, [dmgAll]);

  const { data: invAll = [] } = useQuery({
    queryKey: ["finance-inventory-mtd-all", startOfMonthISO],
    queryFn: async () => {
      const { data } = await supabase
        .from('inventory_usage')
        .select('property, quantity, date')
        .gte('date', startOfMonthISO);
      return data || [];
    },
    refetchInterval: 30000,
  });

  const invTotalsByName = React.useMemo(() => {
    const map: Record<string, number> = {};
    (invAll as any[]).forEach((r: any) => {
      const name = r.property as string | null;
      if (!name) return;
      map[name] = (map[name] || 0) + (r.quantity || 0);
    });
    return map;
  }, [invAll]);

  const villaRows = React.useMemo(() => {
    return (properties || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      damage: damageTotalsById[p.id] || 0,
      invQty: invTotalsByName[p.name] || 0,
    }));
  }, [properties, damageTotalsById, invTotalsByName]);

  const [sortBy, setSortBy] = useState<'name' | 'damage' | 'invQty'>('damage');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const sortedRows = React.useMemo(() => {
    const rows = [...(villaRows || [])];
    rows.sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return rows;
  }, [villaRows, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedRows = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, currentPage]);

  const handleSort = (column: 'name' | 'damage' | 'invQty') => {
    if (sortBy === column) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
    setPage(1);
  };

  const exportCsv = () => {
    const header = ['Villa', 'Damage Cost (EUR)', 'Inventory Usage (qty)'];
    const rows = sortedRows.map(r => [r.name, (r.damage ?? 0).toString(), (r.invQty ?? 0).toString()]);
    const csv = [header, ...rows].map(r => r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance_villas_mtd.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
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

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">All Villas (MTD)</h2>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <button className="flex items-center gap-1" onClick={() => handleSort('name')}>
                        Villa <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </TableHead>
                    <TableHead className="text-right">
                      <button className="flex items-center gap-1 ml-auto" onClick={() => handleSort('damage')}>
                        Damage Cost (EUR) <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </TableHead>
                    <TableHead className="text-right">
                      <button className="flex items-center gap-1 ml-auto" onClick={() => handleSort('invQty')}>
                        Inventory Usage (qty) <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(paginatedRows || []).map((row: any) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(row.damage)}</TableCell>
                      <TableCell className="text-right">{row.invQty}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Finance;
