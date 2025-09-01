import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Badge } from "@/components/ui/badge";
import { useDashboardData } from "@/hooks/useDashboardData";

const OCCUPANCY_COLORS = {
  occupied: "#10b981",    // emerald-500
  vacant: "#6b7280",      // gray-500
  maintenance: "#f59e0b"  // amber-500
};

export const OccupancyOverviewWidget: React.FC = () => {
  const { occupancyData, loading } = useDashboardData();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Occupancy Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 animate-pulse bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const data = [
    { name: 'Occupied', value: occupancyData?.occupied || 0, color: OCCUPANCY_COLORS.occupied },
    { name: 'Vacant', value: occupancyData?.vacant || 0, color: OCCUPANCY_COLORS.vacant },
    { name: 'Maintenance', value: occupancyData?.maintenance || 0, color: OCCUPANCY_COLORS.maintenance }
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const occupancyRate = total > 0 ? Math.round(((occupancyData?.occupied || 0) / total) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Occupancy Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <div className="w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold">{occupancyRate}%</div>
                <div className="text-xs text-muted-foreground">Occupied</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm">{item.name}</span>
              </div>
              <Badge variant="outline">{item.value}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};