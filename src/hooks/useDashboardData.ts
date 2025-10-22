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
      // Get today's date for filtering
      const today = new Date().toISOString().split('T')[0];
      
      // Count rooms to clean (pending housekeeping tasks for today)
      const { count: roomsToClean } = await supabase
        .from('housekeeping_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .gte('due_date', today);

      // Count rooms to inspect (completed housekeeping tasks awaiting QC)
      const { count: roomsToInspect } = await supabase
        .from('housekeeping_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .eq('qc_status', 'pending');

      // Count urgent maintenance tasks
      const { count: urgentMaintenance } = await supabase
        .from('maintenance_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('priority', 'high')
        .eq('status', 'pending');

      // Count low stock items (where quantity <= min_quantity)
      const { data: lowStockData } = await supabase
        .from('inventory_items')
        .select('quantity, min_quantity');

      const lowStockCount = lowStockData?.filter(item => 
        (item.quantity || 0) <= (item.min_quantity || 0)
      ).length || 0;

      setKpiData({
        roomsToClean: roomsToClean || 0,
        roomsToInspect: roomsToInspect || 0,
        urgentMaintenance: urgentMaintenance || 0,
        lowStockItems: lowStockCount
      });
    } catch (error) {
      console.error('Error fetching KPI data:', error);
      setKpiData({
        roomsToClean: 0,
        roomsToInspect: 0,
        urgentMaintenance: 0,
        lowStockItems: 0
      });
    }
  };

  const fetchPortfolioData = async () => {
    try {
      // Get latest room status for each property from room_status_log
      const { data: roomStatuses } = await supabase
        .from('room_status_log')
        .select('property_id, new_status')
        .order('created_at', { ascending: false });

      // Count rooms by status
      const statusCounts = {
        dirty: 0,
        cleaning: 0,
        cleaned: 0,
        inspected: 0,
        ready: 0
      };

      if (roomStatuses) {
        // Get the latest status for each unique property
        const latestStatuses = new Map();
        roomStatuses.forEach(log => {
          const propertyKey = `${log.property_id}`;
          if (!latestStatuses.has(propertyKey)) {
            latestStatuses.set(propertyKey, log.new_status);
          }
        });

        // Count each status
        latestStatuses.forEach(status => {
          if (status in statusCounts) {
            statusCounts[status as keyof typeof statusCounts]++;
          }
        });
      }

      setPortfolioData(statusCounts);
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      setPortfolioData({
        dirty: 0,
        cleaning: 0,
        cleaned: 0,
        inspected: 0,
        ready: 0
      });
    }
  };

  const fetchOccupancyData = async () => {
    try {
      // Get properties and their current status
      const { data: properties } = await supabase
        .from('properties')
        .select('id, status');

      const occupancyCounts = {
        occupied: 0,
        vacant: 0,
        maintenance: 0
      };

      if (properties) {
        properties.forEach(property => {
          switch (property.status) {
            case 'active':
              occupancyCounts.vacant++;
              break;
            case 'maintenance':
              occupancyCounts.maintenance++;
              break;
            default:
              occupancyCounts.vacant++;
              break;
          }
        });
      }

      setOccupancyData(occupancyCounts);
    } catch (error) {
      console.error('Error fetching occupancy data:', error);
      setOccupancyData({
        occupied: 0,
        vacant: 0,
        maintenance: 0
      });
    }
  };

  const fetchMyTasks = async () => {
    try {
      if (!user) return;

      const today = new Date();
      const urgent = new Date(today.getTime() + 24 * 60 * 60 * 1000); // Next 24 hours

      // Fetch housekeeping tasks assigned to current user
      const { data: housekeepingTasks } = await supabase
        .from('housekeeping_tasks')
        .select('id, title, status, priority, due_date, property_id')
        .eq('assigned_to', user.id)
        .in('status', ['pending', 'in_progress'])
        .lte('due_date', urgent.toISOString())
        .order('due_date', { ascending: true })
        .limit(5);

      // Fetch maintenance tasks assigned to current user
      const { data: maintenanceTasks } = await supabase
        .from('maintenance_tasks')
        .select('id, title, status, priority, due_date, property_id')
        .eq('assigned_to', user.id)
        .in('status', ['pending', 'in_progress'])
        .lte('due_date', urgent.toISOString())
        .order('due_date', { ascending: true })
        .limit(5);

      // Get property names for the tasks
      const propertyIds = [
        ...(housekeepingTasks?.map(t => t.property_id).filter(Boolean) || []),
        ...(maintenanceTasks?.map(t => t.property_id).filter(Boolean) || [])
      ];

      const { data: properties } = propertyIds.length > 0 ? await supabase
        .from('properties')
        .select('id, name')
        .in('id', propertyIds) : { data: [] };

      const propertyMap = new Map<string, string>();
      properties?.forEach(p => propertyMap.set(p.id, p.name));

      // Combine and format tasks
      const allTasks: TaskData[] = [];

      if (housekeepingTasks) {
        allTasks.push(...housekeepingTasks.map(task => ({
          id: task.id,
          title: task.title,
          type: 'housekeeping' as const,
          status: task.status,
          priority: task.priority || 'medium',
          property: propertyMap.get(task.property_id || '') || 'Unknown Property',
          dueDate: task.due_date
        })));
      }

      if (maintenanceTasks) {
        allTasks.push(...maintenanceTasks.map(task => ({
          id: task.id,
          title: task.title,
          type: 'maintenance' as const,
          status: task.status,
          priority: task.priority,
          property: propertyMap.get(task.property_id || '') || 'Unknown Property',
          dueDate: task.due_date
        })));
      }

      // Sort by priority and due date
      allTasks.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 1;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 1;
        
        if (aPriority !== bPriority) return bPriority - aPriority;
        
        const aDate = new Date(a.dueDate || '').getTime();
        const bDate = new Date(b.dueDate || '').getTime();
        return aDate - bDate;
      });

      setMyTasks(allTasks.slice(0, 5));
    } catch (error) {
      console.error('Error fetching my tasks:', error);
      setMyTasks([]);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      // Fetch recent task updates from housekeeping and maintenance
      const { data: recentTasks } = await supabase
        .from('housekeeping_tasks')
        .select('id, title, status, updated_at, assigned_to')
        .not('assigned_to', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(10);

      // Get user names for the assigned tasks
      const userIds = recentTasks?.map(t => t.assigned_to).filter(Boolean) || [];
      const { data: users } = userIds.length > 0 ? await supabase
        .from('profiles')
        .select('user_id, name')
        .in('user_id', userIds) : { data: [] };

      const userMap = new Map<string, string>();
      users?.forEach(u => userMap.set(u.user_id, u.name));

      const activities: ActivityItem[] = [];

      if (recentTasks) {
        recentTasks.forEach(task => {
          let action = '';
          switch (task.status) {
            case 'completed':
              action = 'completed cleaning task';
              break;
            case 'in_progress':
              action = 'started cleaning task';
              break;
            case 'pending':
              action = 'was assigned cleaning task';
              break;
            default:
              action = 'updated cleaning task';
          }

          activities.push({
            id: task.id,
            action: `${action}: ${task.title}`,
            user: userMap.get(task.assigned_to || '') || 'Unknown User',
            timestamp: task.updated_at,
            type: 'task'
          });
        });
      }

      // Sort by timestamp and take latest 5
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setRecentActivity(activities.slice(0, 5));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      setRecentActivity([]);
    }
  };

  const fetchActionItems = async () => {
    try {
      // Check for low stock items that need restocking
      const { data: allInventoryItems } = await supabase
        .from('inventory_items')
        .select('id, name, quantity, min_quantity');

      const lowStockItems = allInventoryItems?.filter(item =>
        (item.quantity || 0) <= (item.min_quantity || 0)
      ).slice(0, 5) || [];

      // Check for pending maintenance tasks that need approval
      const { data: pendingMaintenance } = await supabase
        .from('maintenance_tasks')
        .select('id, title, priority, created_at')
        .eq('status', 'pending')
        .eq('priority', 'high')
        .limit(3);

      const actionItems: ActionItem[] = [];

      // Add low stock items as purchase orders
      if (lowStockItems) {
        lowStockItems.forEach(item => {
          actionItems.push({
            id: `stock-${item.id}`,
            type: 'purchase_order',
            title: `Restock ${item.name}`,
            description: `Current stock: ${item.quantity}, Minimum: ${item.min_quantity}`,
            priority: item.quantity === 0 ? 'high' : 'medium'
          });
        });
      }

      // Add urgent maintenance as approval needed
      if (pendingMaintenance) {
        pendingMaintenance.forEach(task => {
          actionItems.push({
            id: `maintenance-${task.id}`,
            type: 'approval_needed',
            title: `Urgent: ${task.title}`,
            description: 'High priority maintenance task needs immediate attention',
            priority: 'high',
            dueDate: task.created_at
          });
        });
      }

      setActionItems(actionItems);
    } catch (error) {
      console.error('Error fetching action items:', error);
      setActionItems([]);
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
