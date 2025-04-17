
import { Check, Gauge, Home, Users } from "lucide-react";
import React from "react";

export interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
    text: string;
  };
  icon: React.ReactNode;
  color: string;
}

export const createMetricCards = (data: any, filter: any[] = []): MetricCardProps[] => {
  // Properties metrics
  const propertiesMetrics = data?.properties ? [
    {
      title: "Total Properties",
      value: data.properties.total,
      icon: React.createElement(Home, { className: "h-5 w-5" }),
      color: "bg-blue-100 text-blue-700"
    },
    {
      title: "Occupied Properties",
      value: data.properties.occupied,
      icon: React.createElement(Users, { className: "h-5 w-5" }),
      color: "bg-green-100 text-green-700"
    },
    {
      title: "Vacant Properties",
      value: data.properties.vacant,
      icon: React.createElement(Home, { className: "h-5 w-5" }),
      color: "bg-amber-100 text-amber-700"
    }
  ] : [];

  // Tasks metrics
  const tasksMetrics = data?.tasks ? [
    {
      title: "Total Tasks",
      value: data.tasks.total,
      icon: React.createElement(Check, { className: "h-5 w-5" }),
      color: "bg-purple-100 text-purple-700"
    },
    {
      title: "Completed Tasks",
      value: data.tasks.completed,
      trend: {
        value: 15,
        isPositive: true,
        text: "from last week"
      },
      icon: React.createElement(Check, { className: "h-5 w-5" }),
      color: "bg-green-100 text-green-700"
    },
    {
      title: "Pending Tasks",
      value: data.tasks.pending,
      icon: React.createElement(Check, { className: "h-5 w-5" }),
      color: "bg-amber-100 text-amber-700"
    }
  ] : [];

  // Maintenance metrics
  const maintenanceMetrics = data?.maintenance ? [
    {
      title: "Total Maintenance",
      value: data.maintenance.total,
      icon: React.createElement(Gauge, { className: "h-5 w-5" }),
      color: "bg-sky-100 text-sky-700"
    },
    {
      title: "Critical Issues",
      value: data.maintenance.critical,
      icon: React.createElement(Gauge, { className: "h-5 w-5" }),
      color: "bg-red-100 text-red-700"
    },
    {
      title: "Standard Maintenance",
      value: data.maintenance.standard,
      icon: React.createElement(Gauge, { className: "h-5 w-5" }),
      color: "bg-blue-100 text-blue-700"
    }
  ] : [];

  // Combine all metrics
  const allMetrics = [...propertiesMetrics, ...tasksMetrics, ...maintenanceMetrics];
  
  // If filter is provided and not empty, filter the metrics
  if (filter && filter.length > 0) {
    return allMetrics.filter(metric => filter.includes(metric.title));
  }
  
  return allMetrics;
};
