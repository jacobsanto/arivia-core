
import { MetricCardProps } from "./MetricCard";

export interface DashboardMetricData {
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
}

export const createMetricCards = (data: DashboardMetricData, isMobile: boolean): Array<Omit<MetricCardProps, 'swipeable'>> => {
  // Calculate variants based on data
  const tasksVariant: 'warning' | 'success' = data.tasks.pending > data.tasks.completed / 2 ? 'warning' : 'success';
  const maintenanceVariant: 'warning' | 'success' = data.maintenance.critical > 0 ? 'warning' : 'success';
  
  return [
    {
      title: "Properties",
      value: data.properties.total.toString(),
      description: "Properties Managed",
      footer: isMobile ? (
        <div className="text-2xs text-muted-foreground">
          <span className="text-green-500">{data.properties.occupied}</span> Occ | 
          <span className="text-blue-500"> {data.properties.vacant}</span> Vac
        </div>
      ) : (
        <div className="text-xs text-muted-foreground font-condensed">
          <span className="text-green-500 font-medium">{data.properties.occupied}</span> Occupied | 
          <span className="text-blue-500 font-medium"> {data.properties.vacant}</span> Vacant
        </div>
      ),
      trend: {
        value: 8,
        isPositive: true
      },
      variant: 'accent' as const
    },
    {
      title: "Tasks",
      value: data.tasks.total.toString(),
      description: "Active Tasks",
      footer: isMobile ? (
        <div className="text-2xs text-muted-foreground">
          <span className="text-green-500">{data.tasks.completed}</span> Done | 
          <span className="text-amber-500"> {data.tasks.pending}</span> Pend
        </div>
      ) : (
        <div className="text-xs text-muted-foreground font-condensed">
          <span className="text-green-500 font-medium">{data.tasks.completed}</span> Completed | 
          <span className="text-amber-500 font-medium"> {data.tasks.pending}</span> Pending
        </div>
      ),
      trend: {
        value: 12,
        isPositive: data.tasks.completed > data.tasks.pending
      },
      variant: tasksVariant
    },
    {
      title: "Maintenance",
      value: data.maintenance.total.toString(),
      description: "Maintenance Issues",
      footer: isMobile ? (
        <div className="text-2xs text-muted-foreground">
          <span className="text-red-500">{data.maintenance.critical}</span> Crit | 
          <span className="text-blue-500"> {data.maintenance.standard}</span> Std
        </div>
      ) : (
        <div className="text-xs text-muted-foreground font-condensed">
          <span className="text-red-500 font-medium">{data.maintenance.critical}</span> Critical | 
          <span className="text-blue-500 font-medium"> {data.maintenance.standard}</span> Standard
        </div>
      ),
      trend: {
        value: data.maintenance.critical > 0 ? 5 : 2,
        isPositive: data.maintenance.critical === 0
      },
      variant: maintenanceVariant
    }
  ];
};
