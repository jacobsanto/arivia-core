
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Percent, CreditCard } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface FinancialSummaryProps {
  listingId: string;
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({ listingId }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['financials', listingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_reports')
        .select('revenue, expenses, profit, margin, currency')
        .eq('listing_id', listingId);
      
      if (error) throw error;
      
      // Calculate totals
      const totals = data.reduce((acc, curr) => {
        acc.revenue += curr.revenue || 0;
        acc.expenses += curr.expenses || 0;
        acc.profit += curr.profit || 0;
        
        // Use the first currency we find (assuming all entries have the same currency)
        if (!acc.currency && curr.currency) {
          acc.currency = curr.currency;
        }
        
        return acc;
      }, { revenue: 0, expenses: 0, profit: 0, currency: '' });
      
      // Calculate the overall margin
      totals.margin = totals.revenue > 0 
        ? ((totals.profit / totals.revenue) * 100).toFixed(1) + '%' 
        : '0%';
      
      return totals;
    },
    enabled: !!listingId
  });
  
  const formatCurrency = (value: number) => {
    if (!data) return 'Loading...';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: data.currency || 'EUR'
    }).format(value);
  };
  
  if (isLoading) {
    return (
      <Card className="bg-muted/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Financial Summary</CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="text-center text-sm text-muted-foreground py-2">
            Loading financial data...
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!data || data.revenue === 0) {
    return (
      <Card className="bg-muted/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Financial Summary</CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="text-center text-sm text-muted-foreground py-2">
            No financial data available
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-muted/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Financial Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pb-2">
        <div className="grid grid-cols-2 gap-1">
          <div className="flex items-center text-sm">
            <DollarSign className="mr-1 h-4 w-4 text-green-500" />
            <span className="text-muted-foreground">Total Revenue:</span>
          </div>
          <div className="text-right font-medium">
            {formatCurrency(data.revenue)}
          </div>
            
          <div className="flex items-center text-sm">
            <CreditCard className="mr-1 h-4 w-4 text-red-500" />
            <span className="text-muted-foreground">Total Expenses:</span>
          </div>
          <div className="text-right font-medium">
            {formatCurrency(data.expenses)}
          </div>
            
          <div className="flex items-center text-sm">
            <DollarSign className="mr-1 h-4 w-4 text-blue-500" />
            <span className="text-muted-foreground">Total Profit:</span>
          </div>
          <div className="text-right font-medium">
            {formatCurrency(data.profit)}
          </div>
            
          <div className="flex items-center text-sm">
            <Percent className="mr-1 h-4 w-4 text-amber-500" />
            <span className="text-muted-foreground">Profit Margin:</span>
          </div>
          <div className="text-right font-medium">
            {data.margin}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
