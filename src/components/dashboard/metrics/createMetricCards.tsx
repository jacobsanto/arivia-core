
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { MetricCardFooterData } from "./MetricCard";

// Define the metric card type to match MetricCardProps
export type MetricCard = {
  title: string;
  value: string | number;
  description?: string;
  footer?: MetricCardFooterData;
  trend?: {
    value: number;
    isPositive: boolean;
    icon?: React.ReactNode;
  };
  variant?: "default" | "success" | "destructive" | "warning" | "info";
};

// Create metric cards from data
export const createMetricCards = (data: any, isMobile: boolean): MetricCard[] => {
  // Ensure all required data exists
  const properties = data.properties || { total: 0, occupied: 0, vacant: 0 };
  const tasks = data.tasks || { total: 0, completed: 0, pending: 0 };
  const maintenance = data.maintenance || { total: 0, critical: 0, standard: 0 };

  // Calculate occupancy rate
  const occupancyRate = properties.total > 0 
    ? Math.round((properties.occupied / properties.total) * 100)
    : 0;
  
  // Calculate task completion rate
  const taskCompletionRate = tasks.total > 0
    ? Math.round((tasks.completed / tasks.total) * 100) 
    : 0;

  // Create metric cards based on mobile or desktop
  return isMobile
    ? [
        // Mobile view - fewer cards to fit screen
        {
          title: "Properties",
          value: properties.total,
          description: `${properties.occupied} Occupied · ${properties.vacant} Vacant`,
          trend: {
            value: occupancyRate,
            isPositive: occupancyRate >= 50,
            icon: occupancyRate >= 50 ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
          },
          variant: (occupancyRate >= 75 ? "success" : (occupancyRate >= 50 ? "default" : "warning"))
        },
        {
          title: "Tasks",
          value: tasks.total,
          description: `${tasks.completed} Completed · ${tasks.pending} Pending`,
          trend: {
            value: taskCompletionRate,
            isPositive: taskCompletionRate >= 75,
            icon: taskCompletionRate >= 75 ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
          },
          variant: (taskCompletionRate >= 75 ? "success" : (taskCompletionRate >= 50 ? "default" : "warning"))
        }
      ]
    : [
        // Desktop view - more detailed cards
        {
          title: "Total Properties",
          value: properties.total,
          description: "Total properties in the system",
        },
        {
          title: "Occupied Properties",
          value: properties.occupied,
          description: `${occupancyRate}% occupancy rate`,
          trend: {
            value: occupancyRate,
            isPositive: occupancyRate >= 50,
            icon: occupancyRate >= 50 ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
          },
          variant: (occupancyRate >= 75 ? "success" : (occupancyRate >= 50 ? "default" : "warning"))
        },
        {
          title: "Vacant Properties",
          value: properties.vacant,
          description: "Available for booking",
          variant: "info"
        },
        {
          title: "Task Completion",
          value: `${taskCompletionRate}%`,
          description: `${tasks.completed} of ${tasks.total} tasks completed`,
          trend: {
            value: taskCompletionRate,
            isPositive: taskCompletionRate >= 75,
            icon: taskCompletionRate >= 75 ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
          },
          variant: (taskCompletionRate >= 75 ? "success" : (taskCompletionRate >= 50 ? "default" : "warning"))
        },
        {
          title: "Pending Tasks",
          value: tasks.pending,
          description: "Require attention",
          variant: tasks.pending > 10 ? "warning" : "default"
        },
        {
          title: "Critical Maintenance",
          value: maintenance.critical,
          description: "High priority maintenance tasks",
          variant: maintenance.critical > 0 ? "destructive" : "success"
        }
      ];
};
