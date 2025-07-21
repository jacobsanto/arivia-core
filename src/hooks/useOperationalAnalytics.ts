import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface OperationalMetrics {
  housekeeping: {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    avgTurnaroundTime: number;
    overdueTasks: number;
  };
  maintenance: {
    totalTasks: number;
    completedTasks: number;
    avgResponseTime: number;
    urgentTasks: number;
    totalCost: number;
  };
  properties: {
    totalProperties: number;
    activeProperties: number;
    occupancyRate: number;
    damageReports: number;
  };
  inventory: {
    totalItems: number;
    lowStockItems: number;
    totalUsage: number;
    topUsedCategories: Array<{ category: string; usage: number }>;
  };
}

export interface PerformanceTrend {
  date: string;
  housekeepingCompletion: number;
  maintenanceResponse: number;
  damageReports: number;
  inventoryUsage: number;
}

export const useOperationalAnalytics = (dateRange: { from: Date; to: Date }) => {
  const [metrics, setMetrics] = useState<OperationalMetrics | null>(null);
  const [trends, setTrends] = useState<PerformanceTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch housekeeping metrics
        const { data: housekeepingTasks, error: hkError } = await supabase
          .from("housekeeping_tasks")
          .select("*")
          .gte("created_at", dateRange.from.toISOString())
          .lte("created_at", dateRange.to.toISOString());

        if (hkError) throw hkError;

        // Fetch maintenance metrics
        const { data: maintenanceTasks, error: mtError } = await supabase
          .from("maintenance_tasks")
          .select("*")
          .gte("created_at", dateRange.from.toISOString())
          .lte("created_at", dateRange.to.toISOString());

        if (mtError) throw mtError;

        // Fetch property metrics
        const { data: properties, error: propError } = await supabase
          .from("guesty_listings")
          .select("*")
          .eq("is_deleted", false);

        if (propError) throw propError;

        // Fetch damage reports
        const { data: damageReports, error: dmgError } = await supabase
          .from("damage_reports")
          .select("*")
          .gte("created_at", dateRange.from.toISOString())
          .lte("created_at", dateRange.to.toISOString());

        if (dmgError) throw dmgError;

        // Fetch inventory usage
        const { data: inventoryUsage, error: invError } = await supabase
          .from("inventory_usage")
          .select("*")
          .gte("date", dateRange.from.toISOString())
          .lte("date", dateRange.to.toISOString());

        if (invError) throw invError;

        // Calculate metrics
        const housekeepingMetrics = {
          totalTasks: housekeepingTasks?.length || 0,
          completedTasks: housekeepingTasks?.filter(t => t.status === "completed").length || 0,
          completionRate: housekeepingTasks?.length 
            ? ((housekeepingTasks.filter(t => t.status === "completed").length / housekeepingTasks.length) * 100)
            : 0,
          avgTurnaroundTime: 24, // Placeholder - would need more complex calculation
          overdueTasks: housekeepingTasks?.filter(t => 
            t.status !== "completed" && new Date(t.due_date) < new Date()
          ).length || 0,
        };

        const maintenanceMetrics = {
          totalTasks: maintenanceTasks?.length || 0,
          completedTasks: maintenanceTasks?.filter(t => t.status === "completed").length || 0,
          avgResponseTime: 12, // Placeholder - would need more complex calculation
          urgentTasks: maintenanceTasks?.filter(t => t.priority === "urgent").length || 0,
          totalCost: 0, // Would need cost field in maintenance_tasks
        };

        const propertyMetrics = {
          totalProperties: properties?.length || 0,
          activeProperties: properties?.filter(p => p.status === "active").length || 0,
          occupancyRate: 75, // Placeholder - would need booking calculation
          damageReports: damageReports?.length || 0,
        };

        // Group inventory usage by category
        const categoryUsage = inventoryUsage?.reduce((acc, item) => {
          acc[item.category] = (acc[item.category] || 0) + item.quantity;
          return acc;
        }, {} as Record<string, number>) || {};

        const inventoryMetrics = {
          totalItems: 0, // Would need inventory_items count
          lowStockItems: 0, // Would need stock level calculation
          totalUsage: inventoryUsage?.reduce((sum, item) => sum + item.quantity, 0) || 0,
          topUsedCategories: Object.entries(categoryUsage)
            .map(([category, usage]) => ({ category, usage }))
            .sort((a, b) => b.usage - a.usage)
            .slice(0, 5),
        };

        setMetrics({
          housekeeping: housekeepingMetrics,
          maintenance: maintenanceMetrics,
          properties: propertyMetrics,
          inventory: inventoryMetrics,
        });

        // Generate trend data (simplified)
        const trendData: PerformanceTrend[] = [];
        const days = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
        
        for (let i = 0; i < Math.min(days, 30); i++) {
          const date = new Date(dateRange.from);
          date.setDate(date.getDate() + i);
          
          trendData.push({
            date: date.toISOString().split('T')[0],
            housekeepingCompletion: Math.floor(Math.random() * 30) + 70,
            maintenanceResponse: Math.floor(Math.random() * 20) + 80,
            damageReports: Math.floor(Math.random() * 5),
            inventoryUsage: Math.floor(Math.random() * 50) + 50,
          });
        }

        setTrends(trendData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateRange]);

  return { metrics, trends, loading, error };
};
