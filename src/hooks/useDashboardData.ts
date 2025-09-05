import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';

export interface DashboardKPIData {
  roomsToClean: number;
  roomsToInspect: number;
  urgentMaintenance: number;
  lowStockItems: number;
}

export interface PortfolioData {
  dirty: number;
  cleaning: number;
  cleaned: number;
  inspected: number;
  ready: number;
}

export interface OccupancyData {
  occupied: number;
  vacant: number;
  maintenance: number;
}

export interface TaskData {
  id: string;
  title: string;
  type: 'housekeeping' | 'maintenance';
  status: string;
  priority: string;
  property: string;
  dueDate?: string;
}

export interface ActivityItem {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  type: 'task' | 'maintenance' | 'damage' | 'inventory';
}

export interface ActionItem {
  id: string;
  type: 'purchase_order' | 'transfer_request' | 'approval_needed';
  title: string;
  description: string;
  priority: string;
  dueDate?: string;
}

export const useDashboardData = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState<DashboardKPIData | null>(null);
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [occupancyData, setOccupancyData] = useState<OccupancyData | null>(null);
  const [myTasks, setMyTasks] = useState<TaskData[] | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[] | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[] | null>(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchKPIData(),
        fetchPortfolioData(),
        fetchOccupancyData(),
        fetchMyTasks(),
        fetchRecentActivity(),
        fetchActionItems()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchKPIData = async () => {
    try {
      // Mock data for now - replace with real Supabase queries
      setKpiData({
        roomsToClean: 8,
        roomsToInspect: 3,
        urgentMaintenance: 2,
        lowStockItems: 5
      });
    } catch (error) {
      console.error('Error fetching KPI data:', error);
    }
  };

  const fetchPortfolioData = async () => {
    try {
      // Mock data for now - replace with real Supabase queries
      setPortfolioData({
        dirty: 8,
        cleaning: 4,
        cleaned: 6,
        inspected: 3,
        ready: 12
      });
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    }
  };

  const fetchOccupancyData = async () => {
    try {
      // Mock data for now - replace with real Supabase queries
      setOccupancyData({
        occupied: 18,
        vacant: 8,
        maintenance: 3
      });
    } catch (error) {
      console.error('Error fetching occupancy data:', error);
    }
  };

  const fetchMyTasks = async () => {
    try {
      if (!user) return;

      // Use fallback data immediately to prevent 502 errors
      // TODO: Implement proper database queries when tables are ready
      setMyTasks([
        {
          id: '1',
          title: 'Clean Ocean Suite',
          type: 'housekeeping',
          status: 'pending',
          priority: 'high',
          property: 'Villa Paradise',
          dueDate: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Fix AC Unit',
          type: 'maintenance',
          status: 'in_progress',
          priority: 'high',
          property: 'Beach House',
          dueDate: new Date(Date.now() + 86400000).toISOString()
        },
        {
          id: '3',
          title: 'Inspect Pool Equipment',
          type: 'maintenance',
          status: 'pending',
          priority: 'medium',
          property: 'Garden Villa',
          dueDate: new Date(Date.now() + 172800000).toISOString()
        }
      ]);
    } catch (error) {
      console.error('Error fetching my tasks:', error);
      // Ensure we always have fallback data
      setMyTasks([]);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      // Mock data for now - replace with real activity log queries
      setRecentActivity([
        {
          id: '1',
          action: 'completed cleaning task',
          user: 'Maria Garcia',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          type: 'task'
        },
        {
          id: '2',
          action: 'created maintenance request',
          user: 'John Smith',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          type: 'maintenance'
        }
      ]);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const fetchActionItems = async () => {
    try {
      // Mock data for now - replace with real queries for pending approvals
      setActionItems([
        {
          id: '1',
          type: 'purchase_order',
          title: 'Cleaning Supplies Order',
          description: 'Pending approval for $250 cleaning supplies order',
          priority: 'medium',
          dueDate: new Date(Date.now() + 172800000).toISOString()
        },
        {
          id: '2',
          type: 'transfer_request',
          title: 'Inventory Transfer',
          description: 'Transfer of linens from storage to Villa Paradise',
          priority: 'low'
        }
      ]);
    } catch (error) {
      console.error('Error fetching action items:', error);
    }
  };

  return {
    loading,
    kpiData,
    portfolioData,
    occupancyData,
    myTasks,
    recentActivity,
    actionItems,
    refetch: fetchDashboardData
  };
};
