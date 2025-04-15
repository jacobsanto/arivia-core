
import { MetricCardProps } from "./MetricCard";
import React from "react";

export interface DashboardMetricData {
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

export const createMetricCards = (data: DashboardMetricData, isMobile: boolean): Array<Omit<MetricCardProps, 'swipeable'>> => {
  // Ensure data structure with defaults
  const properties = data?.properties || { total: 0, occupied: 0, vacant: 0 };
  const tasks = data?.tasks || { total: 0, completed: 0, pending: 0 };
  const maintenance = data?.maintenance || { total: 0, critical: 0, standard: 0 };
  
  // Calculate variants based on data
  const tasksVariant: 'warning' | 'success' = tasks.pending > tasks.completed / 2 ? 'warning' : 'success';
  const maintenanceVariant: 'warning' | 'success' = maintenance.critical > 0 ? 'warning' : 'success';
  
  // Create footer content as string representations instead of JSX
  const propertiesFooterMobile = {
    text: `${properties.occupied} Occ | ${properties.vacant} Vac`,
    occupied: properties.occupied,
    vacant: properties.vacant
  };
  
  const propertiesFooterDesktop = {
    text: `${properties.occupied} Occupied | ${properties.vacant} Vacant`,
    occupied: properties.occupied,
    vacant: properties.vacant
  };
  
  const tasksFooterMobile = {
    text: `${tasks.completed} Done | ${tasks.pending} Pend`,
    completed: tasks.completed,
    pending: tasks.pending
  };
  
  const tasksFooterDesktop = {
    text: `${tasks.completed} Completed | ${tasks.pending} Pending`,
    completed: tasks.completed,
    pending: tasks.pending
  };
  
  const maintenanceFooterMobile = {
    text: `${maintenance.critical} Crit | ${maintenance.standard} Std`,
    critical: maintenance.critical,
    standard: maintenance.standard
  };
  
  const maintenanceFooterDesktop = {
    text: `${maintenance.critical} Critical | ${maintenance.standard} Standard`,
    critical: maintenance.critical,
    standard: maintenance.standard
  };
  
  return [
    {
      title: "Properties",
      value: properties.total.toString(),
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
      value: tasks.total.toString(),
      description: "Active Tasks",
      footer: isMobile ? tasksFooterMobile : tasksFooterDesktop,
      trend: {
        value: 12,
        isPositive: tasks.completed > tasks.pending
      },
      variant: tasksVariant
    },
    {
      title: "Maintenance",
      value: maintenance.total.toString(),
      description: "Maintenance Issues",
      footer: isMobile ? maintenanceFooterMobile : maintenanceFooterDesktop,
      trend: {
        value: maintenance.critical > 0 ? 5 : 2,
        isPositive: maintenance.critical === 0
      },
      variant: maintenanceVariant
    }
  ];
};
