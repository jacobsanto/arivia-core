import React, { useEffect, useState } from "react";
import { Building, Calendar, CheckCircle, AlertTriangle, DollarSign, TrendingUp, Users, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SmartMetricsCard } from "./SmartMetricsCard";
import { format, subDays, subMonths, isAfter } from "date-fns";

interface MetricsData {
  totalProperties: number;
  activeBookings: number;
  pendingTasks: number;
  maintenanceIssues: number;
  monthlyRevenue: number;
  occupancyRate: number;
  averageStay: number;
  taskCompletionRate: number;
}

interface TrendData {
  value: number;
  percentage: number;
  direction: 'up' | 'down' | 'stable';
  period: string;
}

export const SmartMetricsGrid: React.FC = () => {
  const [realTimeData, setRealTimeData] = useState<MetricsData | null>(null);

  // Main metrics query with trend calculation
  const { data: metrics, isLoading, refetch } = useQuery({
    queryKey: ['smart-dashboard-metrics'],
    queryFn: async () => {
      const today = new Date();
      const lastMonth = subMonths(today, 1);
      const lastWeek = subDays(today, 7);

      // Get current metrics
      const [properties, bookings, tasks, maintenance, financialData] = await Promise.all([
        supabase.from('guesty_listings').select('*').eq('is_deleted', false),
        supabase.from('guesty_bookings').select('*').eq('status', 'confirmed'),
        supabase.from('housekeeping_tasks').select('*'),
        supabase.from('maintenance_tasks').select('*'),
        supabase.from('financial_reports').select('*')
      ]);

      // Calculate current period metrics
      const currentBookings = bookings.data?.filter(b => 
        isAfter(new Date(b.check_in), lastMonth)
      ) || [];
      
      const currentTasks = tasks.data?.filter(t => 
        isAfter(new Date(t.created_at), lastMonth)
      ) || [];
      
      const completedTasks = currentTasks.filter(t => t.status === 'completed');
      const pendingTasks = currentTasks.filter(t => t.status === 'pending');
      
      const currentRevenue = financialData.data?.reduce((sum, report) => 
        sum + (report.revenue || 0), 0) || 0;

      // Calculate previous period for trends
      const previousMonth = subMonths(lastMonth, 1);
      const previousBookings = bookings.data?.filter(b => 
        isAfter(new Date(b.check_in), previousMonth) && 
        !isAfter(new Date(b.check_in), lastMonth)
      ) || [];

      // Calculate trends
      const bookingsTrend = calculateTrend(currentBookings.length, previousBookings.length);
      const taskCompletionRate = currentTasks.length > 0 
        ? (completedTasks.length / currentTasks.length) * 100 
        : 0;

      const occupancyRate = properties.data?.length > 0 
        ? (currentBookings.length / properties.data.length) * 100 
        : 0;

      const averageStay = currentBookings.length > 0
        ? currentBookings.reduce((sum, booking) => {
            const checkIn = new Date(booking.check_in);
            const checkOut = new Date(booking.check_out);
            const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
            return sum + nights;
          }, 0) / currentBookings.length
        : 0;

      return {
        totalProperties: properties.data?.length || 0,
        activeBookings: currentBookings.length,
        pendingTasks: pendingTasks.length,
        maintenanceIssues: maintenance.data?.filter(m => m.status === 'pending').length || 0,
        monthlyRevenue: currentRevenue,
        occupancyRate: Math.round(occupancyRate),
        averageStay: Math.round(averageStay * 10) / 10,
        taskCompletionRate: Math.round(taskCompletionRate),
        trends: {
          bookings: bookingsTrend,
          revenue: calculateTrend(currentRevenue, 0), // Simplified for now
        }
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds for real-time feel
  });

  // Set up real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'guesty_bookings'
      }, () => {
        refetch();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'housekeeping_tasks'
      }, () => {
        refetch();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const calculateTrend = (current: number, previous: number): TrendData => {
    if (previous === 0) {
      return {
        value: current,
        percentage: 0,
        direction: 'stable',
        period: 'vs last month'
      };
    }

    const percentage = Math.round(((current - previous) / previous) * 100);
    const direction = percentage > 5 ? 'up' : percentage < -5 ? 'down' : 'stable';

    return {
      value: current,
      percentage: Math.abs(percentage),
      direction,
      period: 'vs last month'
    };
  };

  const getStatus = (value: number, type: string): 'success' | 'warning' | 'error' | 'info' => {
    switch (type) {
      case 'occupancy':
        return value >= 80 ? 'success' : value >= 60 ? 'warning' : 'error';
      case 'completion':
        return value >= 90 ? 'success' : value >= 70 ? 'warning' : 'error';
      case 'maintenance':
        return value === 0 ? 'success' : value <= 3 ? 'warning' : 'error';
      default:
        return 'info';
    }
  };

  const metricCards = [
    {
      title: "Total Properties",
      value: metrics?.totalProperties || 0,
      icon: Building,
      status: 'info' as const,
      subtitle: "Active listings"
    },
    {
      title: "Monthly Revenue",
      value: `€${(metrics?.monthlyRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      trend: metrics?.trends?.revenue,
      status: 'success' as const,
      subtitle: "Current month"
    },
    {
      title: "Occupancy Rate",
      value: `${metrics?.occupancyRate || 0}%`,
      icon: Calendar,
      status: getStatus(metrics?.occupancyRate || 0, 'occupancy'),
      subtitle: "This month"
    },
    {
      title: "Active Bookings",
      value: metrics?.activeBookings || 0,
      icon: Users,
      trend: metrics?.trends?.bookings,
      status: 'info' as const,
      subtitle: "Confirmed bookings"
    },
    {
      title: "Task Completion",
      value: `${metrics?.taskCompletionRate || 0}%`,
      icon: CheckCircle,
      status: getStatus(metrics?.taskCompletionRate || 0, 'completion'),
      subtitle: "This month"
    },
    {
      title: "Average Stay",
      value: `${metrics?.averageStay || 0} nights`,
      icon: Clock,
      status: 'info' as const,
      subtitle: "Per booking"
    },
    {
      title: "Pending Tasks",
      value: metrics?.pendingTasks || 0,
      icon: AlertTriangle,
      status: (metrics?.pendingTasks || 0) === 0 ? ('success' as const) : ('warning' as const),
      subtitle: "Require attention"
    },
    {
      title: "Maintenance Issues",
      value: metrics?.maintenanceIssues || 0,
      icon: AlertTriangle,
      status: getStatus(metrics?.maintenanceIssues || 0, 'maintenance'),
      subtitle: "Open tickets"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Smart Analytics Overview</h2>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-muted-foreground">Live data</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric, index) => (
          <SmartMetricsCard
            key={index}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            trend={metric.trend}
            status={metric.status}
            subtitle={metric.subtitle}
            isLoading={isLoading}
            onClick={() => {
              // Future: Navigate to detailed view
              console.log(`Clicked on ${metric.title}`);
            }}
          />
        ))}
      </div>
    </div>
  );
};