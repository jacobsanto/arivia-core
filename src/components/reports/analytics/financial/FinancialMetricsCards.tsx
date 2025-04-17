
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const FinancialMetricsCards: React.FC<{ financialData: any[] }> = ({ financialData }) => {
  const isEmpty = !financialData || financialData.length === 0;
  
  // If no data, show empty state
  if (isEmpty) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <EmptyMetricCard 
          title="Total Revenue" 
          description="No revenue data available" 
          icon={<Wallet className="h-4 w-4 text-muted-foreground" />} 
        />
        <EmptyMetricCard 
          title="Total Expenses" 
          description="No expense data available" 
          icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />} 
        />
        <EmptyMetricCard 
          title="Total Profit" 
          description="No profit data available" 
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />} 
        />
      </div>
    );
  }
  
  // Calculate metrics only if we have data
  const totalRevenue = financialData.reduce((sum, item) => sum + item.revenue, 0);
  const totalExpenses = financialData.reduce((sum, item) => sum + item.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0.0';
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">€{totalRevenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            For the selected period
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">€{totalExpenses.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            For the selected period
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">€{totalProfit.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {profitMargin}% profit margin
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

// Component for empty state metrics
const EmptyMetricCard: React.FC<{ 
  title: string, 
  description: string, 
  icon: React.ReactNode 
}> = ({ title, description, icon }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">€0</div>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};
