
import React from "react";
import { BuildingIcon, ClipboardCheck, Wrench } from "lucide-react";
import { MetricCardProps } from "./MetricCard";

interface DashboardData {
  properties?: {
    total: number;
    occupied: number;
    vacant: number;
  };
  tasks?: {
    total: number;
    completed: number;
    pending: number;
  };
  maintenance?: {
    total: number;
    critical: number;
    standard: number;
  };
}

export const createMetricCards = (data: DashboardData, isMobile: boolean): Array<Omit<MetricCardProps, 'swipeable'>> => {
  const propertyCard: Omit<MetricCardProps, 'swipeable'> = {
    title: "Properties",
    value: `${data.properties?.total || 0}`,
    description: isMobile ? "Managed properties" : "Total properties under management",
    icon: <BuildingIcon className="h-4 w-4" />,
    footer: {
      text: isMobile ? "Occupancy details" : "Occupied vs Vacant properties",
      occupied: data.properties?.occupied || 0,
      vacant: data.properties?.vacant || 0,
    },
    trend: {
      value: 5,
      isPositive: true
    },
    variant: 'accent' as const
  };

  const tasksCard: Omit<MetricCardProps, 'swipeable'> = {
    title: "Tasks",
    value: `${data.tasks?.total || 0}`,
    description: isMobile ? "Scheduled tasks" : "Total tasks in system",
    icon: <ClipboardCheck className="h-4 w-4" />,
    footer: {
      text: isMobile ? "Status details" : "Completed vs Pending tasks",
      completed: data.tasks?.completed || 0,
      pending: data.tasks?.pending || 0,
    },
    variant: 'default' as const
  };

  const maintenanceCard: Omit<MetricCardProps, 'swipeable'> = {
    title: "Maintenance",
    value: `${data.maintenance?.total || 0}`,
    description: isMobile ? "Maint. tasks" : "Maintenance tasks",
    icon: <Wrench className="h-4 w-4" />,
    footer: {
      text: isMobile ? "Priority details" : "Critical vs Standard issues",
      critical: data.maintenance?.critical || 0,
      standard: data.maintenance?.standard || 0,
    },
    variant: 'warning' as const
  };

  return [propertyCard, tasksCard, maintenanceCard];
};
