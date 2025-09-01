import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useDashboardData } from "@/hooks/useDashboardData";

const ROOM_STATUS_COLORS = {
  dirty: "#ef4444",      // red-500
  cleaning: "#f59e0b",   // amber-500  
  cleaned: "#10b981",    // emerald-500
  inspected: "#3b82f6",  // blue-500
  ready: "#059669"       // emerald-600
};

export const PortfolioReadinessWidget: React.FC = () => {
  const { portfolioData, loading } = useDashboardData();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Readiness</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 animate-pulse bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const data = [
    { name: 'Dirty', value: portfolioData?.dirty || 0, color: ROOM_STATUS_COLORS.dirty },
    { name: 'Cleaning', value: portfolioData?.cleaning || 0, color: ROOM_STATUS_COLORS.cleaning },
    { name: 'Cleaned', value: portfolioData?.cleaned || 0, color: ROOM_STATUS_COLORS.cleaned },
    { name: 'Inspected', value: portfolioData?.inspected || 0, color: ROOM_STATUS_COLORS.inspected },
    { name: 'Ready', value: portfolioData?.ready || 0, color: ROOM_STATUS_COLORS.ready }
  ].filter(item => item.value > 0);

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const readyPercentage = total > 0 ? Math.round(((portfolioData?.ready || 0) / total) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Portfolio Readiness
          <span className="text-sm font-normal text-muted-foreground">
            {readyPercentage}% Ready
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Guest Ready:</span>
            <span className="font-medium">{portfolioData?.ready || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Need Attention:</span>
            <span className="font-medium">
              {(portfolioData?.dirty || 0) + (portfolioData?.cleaning || 0)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};