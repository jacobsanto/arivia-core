
import { MetricCardProps } from "./MetricCard";
import React from "react";

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
  
  // Create footer content as string representations instead of JSX
  const propertiesFooterMobile = {
    text: `${data.properties.occupied} Occ | ${data.properties.vacant} Vac`,
    occupied: data.properties.occupied,
    vacant: data.properties.vacant
  };
  
  const propertiesFooterDesktop = {
    text: `${data.properties.occupied} Occupied | ${data.properties.vacant} Vacant`,
    occupied: data.properties.occupied,
    vacant: data.properties.vacant
  };
  
  const tasksFooterMobile = {
    text: `${data.tasks.completed} Done | ${data.tasks.pending} Pend`,
    completed: data.tasks.completed,
    pending: data.tasks.pending
  };
  
  const tasksFooterDesktop = {
    text: `${data.tasks.completed} Completed | ${data.tasks.pending} Pending`,
    completed: data.tasks.completed,
    pending: data.tasks.pending
  };
  
  const maintenanceFooterMobile = {
    text: `${data.maintenance.critical} Crit | ${data.maintenance.standard} Std`,
    critical: data.maintenance.critical,
    standard: data.maintenance.standard
  };
  
  const maintenanceFooterDesktop = {
    text: `${data.maintenance.critical} Critical | ${data.maintenance.standard} Standard`,
    critical: data.maintenance.critical,
    standard: data.maintenance.standard
  };
  
  return [
    {
      title: "Properties",
      value: data.properties.total.toString(),
      description: "Properties Managed",
      footer: isMobile ? propertiesFooterMobile : propertiesFooterDesktop,
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
      footer: isMobile ? tasksFooterMobile : tasksFooterDesktop,
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
      footer: isMobile ? maintenanceFooterMobile : maintenanceFooterDesktop,
      trend: {
        value: data.maintenance.critical > 0 ? 5 : 2,
        isPositive: data.maintenance.critical === 0
      },
      variant: maintenanceVariant
    }
  ];
};
