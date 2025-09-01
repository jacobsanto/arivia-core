import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  Home, 
  Clock, 
  AlertTriangle, 
  Package,
  ArrowRight 
} from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";

export const KpiSummaryWidget: React.FC = () => {
  const navigate = useNavigate();
  const { kpiData, loading } = useDashboardData();

  const kpis = [
    {
      label: "Rooms to Clean",
      value: kpiData?.roomsToClean || 0,
      icon: Home,
      color: "bg-blue-500",
      action: () => navigate('/properties?tab=rooms&status=dirty')
    },
    {
      label: "Rooms to Inspect", 
      value: kpiData?.roomsToInspect || 0,
      icon: Clock,
      color: "bg-yellow-500",
      action: () => navigate('/properties?tab=rooms&status=cleaned')
    },
    {
      label: "Urgent Maintenance",
      value: kpiData?.urgentMaintenance || 0,
      icon: AlertTriangle,
      color: "bg-red-500",
      action: () => navigate('/maintenance?priority=high&status=pending')
    },
    {
      label: "Low Stock Items",
      value: kpiData?.lowStockItems || 0,
      icon: Package,
      color: "bg-orange-500",
      action: () => navigate('/inventory?filter=low-stock')
    }
  ];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>KPI Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          KPI Summary
          <Badge variant="outline">Live</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {kpis.map((kpi) => {
            const IconComponent = kpi.icon;
            return (
              <div
                key={kpi.label}
                onClick={kpi.action}
                className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-full ${kpi.color}`}>
                    <IconComponent className="h-4 w-4 text-white" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="text-sm text-muted-foreground">{kpi.label}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};