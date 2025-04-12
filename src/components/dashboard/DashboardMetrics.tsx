
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  footer?: React.ReactNode;
}

export const MetricCard = ({ title, value, description, footer }: MetricCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-xl md:text-2xl font-bold tracking-tight">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
      {footer && <div className="mt-2">{footer}</div>}
    </CardContent>
  </Card>
);

interface DashboardMetricsProps {
  data: {
    properties: {
      total: number;
      occupied: number;
      vacant: number;
    };
    tasks: {
      total: number;
      completed: number;
      pending: number;
    };
    maintenance: {
      total: number;
      critical: number;
      standard: number;
    };
  };
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ data }) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <MetricCard
        title="Properties"
        value={data.properties.total.toString()}
        description="Properties Managed"
        footer={
          <div className="text-xs text-muted-foreground font-condensed">
            <span className="text-green-500 font-medium">{data.properties.occupied}</span> Occupied | 
            <span className="text-blue-500 font-medium"> {data.properties.vacant}</span> Vacant
          </div>
        }
      />
      <MetricCard
        title="Tasks"
        value={data.tasks.total.toString()}
        description="Active Tasks"
        footer={
          <div className="text-xs text-muted-foreground font-condensed">
            <span className="text-green-500 font-medium">{data.tasks.completed}</span> Completed | 
            <span className="text-amber-500 font-medium"> {data.tasks.pending}</span> Pending
          </div>
        }
      />
      <MetricCard
        title="Maintenance"
        value={data.maintenance.total.toString()}
        description="Maintenance Issues"
        footer={
          <div className="text-xs text-muted-foreground font-condensed">
            <span className="text-red-500 font-medium">{data.maintenance.critical}</span> Critical | 
            <span className="text-blue-500 font-medium"> {data.maintenance.standard}</span> Standard
          </div>
        }
      />
    </div>
  );
};

export default DashboardMetrics;
