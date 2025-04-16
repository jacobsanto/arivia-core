
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

const createMetricCards = (data: DashboardData, isMobile: boolean): Array<Omit<MetricCardProps, 'swipeable'>> => {
  const cards: Array<Omit<MetricCardProps, 'swipeable'>> = [];
  
  // Only add the property card if properties data exists and has valid values
  if (data.properties && 
      typeof data.properties.total === 'number' && 
      typeof data.properties.occupied === 'number' && 
      typeof data.properties.vacant === 'number') {
    cards.push({
      title: "Properties",
      value: `${data.properties.total}`,
      description: isMobile ? "Managed properties" : "Total properties under management",
      icon: <BuildingIcon className="h-4 w-4" />,
      footer: {
        text: isMobile ? "Occupancy details" : "Occupied vs Vacant properties",
        occupied: data.properties.occupied || 0,
        vacant: data.properties.vacant || 0,
      },
      trend: {
        value: 5,
        isPositive: true
      },
      variant: 'accent' as const
    });
  }

  // Only add the tasks card if tasks data exists and has valid values
  if (data.tasks && 
      typeof data.tasks.total === 'number' && 
      typeof data.tasks.completed === 'number' && 
      typeof data.tasks.pending === 'number') {
    cards.push({
      title: "Tasks",
      value: `${data.tasks.total}`,
      description: isMobile ? "Scheduled tasks" : "Total tasks in system",
      icon: <ClipboardCheck className="h-4 w-4" />,
      footer: {
        text: isMobile ? "Status details" : "Completed vs Pending tasks",
        completed: data.tasks.completed || 0,
        pending: data.tasks.pending || 0,
      },
      variant: 'default' as const
    });
  }

  // Only add the maintenance card if maintenance data exists and has valid values
  if (data.maintenance && 
      typeof data.maintenance.total === 'number' && 
      typeof data.maintenance.critical === 'number' && 
      typeof data.maintenance.standard === 'number') {
    cards.push({
      title: "Maintenance",
      value: `${data.maintenance.total}`,
      description: isMobile ? "Maint. tasks" : "Maintenance tasks",
      icon: <Wrench className="h-4 w-4" />,
      footer: {
        text: isMobile ? "Priority details" : "Critical vs Standard issues",
        critical: data.maintenance.critical || 0,
        standard: data.maintenance.standard || 0,
      },
      variant: 'warning' as const
    });
  }

  return cards;
};

export default createMetricCards;
