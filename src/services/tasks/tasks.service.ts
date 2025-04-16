
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MaintenanceTask {
  id: string;
  title: string;
  property: string;
  type: string;
  status: string;
  priority: string;
  dueDate: string;
  assignee?: string;
  description?: string;
  location?: string;
  requiredTools?: string[];
  instructions?: { id: number; title: string; completed: boolean }[];
  beforePhotos?: string[];
  afterPhotos?: string[];
  beforeVideos?: string[];
  afterVideos?: string[];
  report?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface HousekeepingTask {
  id: string;
  title: string;
  property: string;
  type: string;
  status: string;
  priority: string;
  dueDate: string;
  assignedTo?: string;
  description?: string;
  approvalStatus?: string;
  rejectionReason?: string;
  photos?: string[];
  checklist?: { id: number; title: string; completed: boolean }[];
  created_at?: string;
  updated_at?: string;
}

// Define database structure interfaces to avoid type mismatches
interface MaintenanceTaskDB {
  id: string;
  title: string;
  property_id: string;
  status: string;
  priority: string;
  due_date: string;
  assigned_to?: string;
  description?: string;
  location?: string;
  required_tools?: string;
  created_at: string;
  updated_at: string;
}

interface HousekeepingTaskDB {
  id: string;
  title: string;
  property_id: string;
  status: string;
  priority: string;
  due_date: string;
  assigned_to?: string;
  description?: string;
  approval_status?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

// Mapping functions between DB and client types
const mapDbToMaintenanceTask = (db: MaintenanceTaskDB): MaintenanceTask => {
  return {
    id: db.id,
    title: db.title,
    property: db.property_id,
    type: 'Maintenance',
    status: db.status,
    priority: db.priority,
    dueDate: db.due_date,
    assignee: db.assigned_to,
    description: db.description,
    location: db.location,
    requiredTools: db.required_tools ? db.required_tools.split(',') : [],
    created_at: db.created_at,
    updated_at: db.updated_at
  };
};

const mapMaintenanceTaskToDb = (task: Partial<MaintenanceTask>): Partial<MaintenanceTaskDB> => {
  return {
    title: task.title,
    property_id: task.property,
    status: task.status,
    priority: task.priority,
    due_date: task.dueDate,
    assigned_to: task.assignee,
    description: task.description,
    location: task.location,
    required_tools: task.requiredTools ? task.requiredTools.join(',') : undefined
  };
};

const mapDbToHousekeepingTask = (db: HousekeepingTaskDB): HousekeepingTask => {
  return {
    id: db.id,
    title: db.title,
    property: db.property_id,
    type: 'Housekeeping',
    status: db.status,
    priority: db.priority,
    dueDate: db.due_date,
    assignedTo: db.assigned_to,
    description: db.description,
    approvalStatus: db.approval_status,
    rejectionReason: db.rejection_reason,
    created_at: db.created_at,
    updated_at: db.updated_at
  };
};

const mapHousekeepingTaskToDb = (task: Partial<HousekeepingTask>): Partial<HousekeepingTaskDB> => {
  return {
    title: task.title,
    property_id: task.property,
    status: task.status,
    priority: task.priority,
    due_date: task.dueDate,
    assigned_to: task.assignedTo,
    description: task.description,
    approval_status: task.approvalStatus,
    rejection_reason: task.rejectionReason
  };
};

export const tasksService = {
  // Maintenance Tasks
  async getMaintenanceTasks(): Promise<MaintenanceTask[]> {
    try {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;
      return (data || []).map(mapDbToMaintenanceTask);
    } catch (error: any) {
      console.error('Error fetching maintenance tasks:', error);
      toast.error('Failed to load maintenance tasks', {
        description: error.message
      });
      return [];
    }
  },

  async getMaintenanceTaskById(id: string): Promise<MaintenanceTask | null> {
    try {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data ? mapDbToMaintenanceTask(data) : null;
    } catch (error: any) {
      console.error(`Error fetching maintenance task with id ${id}:`, error);
      return null;
    }
  },

  async addMaintenanceTask(task: Omit<MaintenanceTask, 'id' | 'created_at' | 'updated_at'>): Promise<MaintenanceTask | null> {
    try {
      const dbTask = mapMaintenanceTaskToDb(task);
      
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .insert(dbTask)
        .select()
        .single();

      if (error) throw error;
      toast.success('Maintenance task added successfully');
      return mapDbToMaintenanceTask(data);
    } catch (error: any) {
      console.error('Error adding maintenance task:', error);
      toast.error('Failed to add maintenance task', {
        description: error.message
      });
      return null;
    }
  },

  async updateMaintenanceTask(id: string, updates: Partial<MaintenanceTask>): Promise<boolean> {
    try {
      const dbUpdates = mapMaintenanceTaskToDb(updates);
      
      const { error } = await supabase
        .from('maintenance_tasks')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
      toast.success('Maintenance task updated successfully');
      return true;
    } catch (error: any) {
      console.error(`Error updating maintenance task with id ${id}:`, error);
      toast.error('Failed to update maintenance task', {
        description: error.message
      });
      return false;
    }
  },

  async deleteMaintenanceTask(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('maintenance_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Maintenance task deleted successfully');
      return true;
    } catch (error: any) {
      console.error(`Error deleting maintenance task with id ${id}:`, error);
      toast.error('Failed to delete maintenance task', {
        description: error.message
      });
      return false;
    }
  },

  // Housekeeping Tasks
  async getHousekeepingTasks(): Promise<HousekeepingTask[]> {
    try {
      const { data, error } = await supabase
        .from('housekeeping_tasks')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;
      return (data || []).map(mapDbToHousekeepingTask);
    } catch (error: any) {
      console.error('Error fetching housekeeping tasks:', error);
      toast.error('Failed to load housekeeping tasks', {
        description: error.message
      });
      return [];
    }
  },

  async getHousekeepingTaskById(id: string): Promise<HousekeepingTask | null> {
    try {
      const { data, error } = await supabase
        .from('housekeeping_tasks')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data ? mapDbToHousekeepingTask(data) : null;
    } catch (error: any) {
      console.error(`Error fetching housekeeping task with id ${id}:`, error);
      return null;
    }
  },

  async addHousekeepingTask(task: Omit<HousekeepingTask, 'id' | 'created_at' | 'updated_at'>): Promise<HousekeepingTask | null> {
    try {
      const dbTask = mapHousekeepingTaskToDb(task);
      
      const { data, error } = await supabase
        .from('housekeeping_tasks')
        .insert(dbTask)
        .select()
        .single();

      if (error) throw error;
      toast.success('Housekeeping task added successfully');
      return mapDbToHousekeepingTask(data);
    } catch (error: any) {
      console.error('Error adding housekeeping task:', error);
      toast.error('Failed to add housekeeping task', {
        description: error.message
      });
      return null;
    }
  },

  async updateHousekeepingTask(id: string, updates: Partial<HousekeepingTask>): Promise<boolean> {
    try {
      const dbUpdates = mapHousekeepingTaskToDb(updates);
      
      const { error } = await supabase
        .from('housekeeping_tasks')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
      toast.success('Housekeeping task updated successfully');
      return true;
    } catch (error: any) {
      console.error(`Error updating housekeeping task with id ${id}:`, error);
      toast.error('Failed to update housekeeping task', {
        description: error.message
      });
      return false;
    }
  },

  async deleteHousekeepingTask(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('housekeeping_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Housekeeping task deleted successfully');
      return true;
    } catch (error: any) {
      console.error(`Error deleting housekeeping task with id ${id}:`, error);
      toast.error('Failed to delete housekeeping task', {
        description: error.message
      });
      return false;
    }
  },

  // Tasks for Today (Both maintenance and housekeeping)
  async getTasksForToday(): Promise<Array<MaintenanceTask | HousekeepingTask>> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayStr = today.toISOString();
      const tomorrowStr = tomorrow.toISOString();

      // Get maintenance tasks for today
      const { data: maintenanceTasks, error: maintenanceError } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .gte('due_date', todayStr)
        .lt('due_date', tomorrowStr);

      if (maintenanceError) throw maintenanceError;

      // Get housekeeping tasks for today
      const { data: housekeepingTasks, error: housekeepingError } = await supabase
        .from('housekeeping_tasks')
        .select('*')
        .gte('due_date', todayStr)
        .lt('due_date', tomorrowStr);

      if (housekeepingError) throw housekeepingError;

      // Combine the tasks
      const allTasks = [
        ...(maintenanceTasks || []).map(mapDbToMaintenanceTask), 
        ...(housekeepingTasks || []).map(mapDbToHousekeepingTask)
      ];
      
      // Sort by due date
      return allTasks.sort((a, b) => {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    } catch (error: any) {
      console.error('Error fetching tasks for today:', error);
      return [];
    }
  }
};
