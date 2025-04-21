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
  bookingId?: string;
  taskType?: string;
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
  title?: string;
  property_id?: string;
  status: string;
  priority?: string;
  due_date: string;
  assigned_to?: string;
  description?: string;
  approval_status?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  booking_id?: string;
  listing_id?: string;
  task_type?: string;
  checklist?: string | any[];
  cleaning_type?: string;
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

const mapMaintenanceTaskToDb = (task: Partial<MaintenanceTask>): Record<string, any> => {
  const result: Record<string, any> = {};
  
  if (task.title !== undefined) result.title = task.title;
  if (task.property !== undefined) result.property_id = task.property;
  if (task.status !== undefined) result.status = task.status;
  if (task.priority !== undefined) result.priority = task.priority;
  if (task.dueDate !== undefined) result.due_date = task.dueDate;
  if (task.assignee !== undefined) result.assigned_to = task.assignee;
  if (task.description !== undefined) result.description = task.description;
  if (task.location !== undefined) result.location = task.location;
  if (task.requiredTools !== undefined) result.required_tools = task.requiredTools.join(',');
  
  return result;
};

const mapDbToHousekeepingTask = (db: HousekeepingTaskDB): HousekeepingTask => {
  const title = db.title || db.task_type || 'Cleaning Task';
  const property = db.property_id || db.listing_id || '';
  
  let checklist: { id: number; title: string; completed: boolean }[] = [];
  if (db.checklist) {
    try {
      if (typeof db.checklist === 'string') {
        checklist = JSON.parse(db.checklist);
      } else if (Array.isArray(db.checklist)) {
        checklist = db.checklist;
      }
    } catch (e) {
      console.error("Error parsing checklist:", e);
    }
  }
  
  return {
    id: db.id,
    title: title,
    property: property,
    type: 'Housekeeping',
    status: db.status,
    priority: db.priority || 'normal',
    dueDate: db.due_date,
    assignedTo: db.assigned_to,
    description: db.description,
    approvalStatus: db.approval_status,
    rejectionReason: db.rejection_reason,
    checklist: checklist,
    created_at: db.created_at,
    updated_at: db.updated_at,
    bookingId: db.booking_id,
    taskType: db.task_type
  };
};

const mapHousekeepingTaskToDb = (task: Partial<HousekeepingTask>): Record<string, any> => {
  const result: Record<string, any> = {};
  
  if (task.title !== undefined) result.title = task.title;
  if (task.property !== undefined) {
    result.property_id = task.property;
    result.listing_id = task.property; // Support both fields
  }
  if (task.status !== undefined) result.status = task.status;
  if (task.priority !== undefined) result.priority = task.priority;
  if (task.dueDate !== undefined) result.due_date = task.dueDate;
  if (task.assignedTo !== undefined) result.assigned_to = task.assignedTo;
  if (task.description !== undefined) result.description = task.description;
  if (task.approvalStatus !== undefined) result.approval_status = task.approvalStatus;
  if (task.rejectionReason !== undefined) result.rejection_reason = task.rejectionReason;
  if (task.checklist !== undefined) result.checklist = JSON.stringify(task.checklist);
  if (task.taskType !== undefined) result.task_type = task.taskType;
  if (task.bookingId !== undefined) result.booking_id = task.bookingId;
  
  return result;
};

export const tasksService = {
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
      
      if (!dbTask.title) throw new Error('Task title is required');
      if (!dbTask.property_id) throw new Error('Property is required');
      if (!dbTask.due_date) throw new Error('Due date is required');
      
      const insertData = {
        title: dbTask.title,
        property_id: dbTask.property_id,
        due_date: dbTask.due_date,
        status: dbTask.status || 'pending',
        priority: dbTask.priority || 'normal',
        assigned_to: dbTask.assigned_to,
        description: dbTask.description,
        location: dbTask.location,
        required_tools: dbTask.requiredTools
      };
      
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .insert(insertData)
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

  async getHousekeepingTasks(): Promise<HousekeepingTask[]> {
    try {
      const { data, error } = await supabase
        .from('housekeeping_tasks')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;
      
      return (data || []).map((item: any) => mapDbToHousekeepingTask(item as HousekeepingTaskDB));
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
      return data ? mapDbToHousekeepingTask(data as HousekeepingTaskDB) : null;
    } catch (error: any) {
      console.error(`Error fetching housekeeping task with id ${id}:`, error);
      return null;
    }
  },

  async addHousekeepingTask(task: Omit<HousekeepingTask, 'id' | 'created_at' | 'updated_at'>): Promise<HousekeepingTask | null> {
    try {
      const dbTask = mapHousekeepingTaskToDb(task);
      
      if (!dbTask.title) throw new Error('Task title is required');
      if (!dbTask.listing_id && !dbTask.property_id) throw new Error('Property is required');
      if (!dbTask.due_date) throw new Error('Due date is required');
      
      const insertData: Record<string, any> = {
        title: dbTask.title,
        property_id: dbTask.property_id || dbTask.listing_id,
        listing_id: dbTask.listing_id || dbTask.property_id,
        due_date: dbTask.due_date,
        status: dbTask.status || 'pending',
        priority: dbTask.priority || 'normal',
        assigned_to: dbTask.assigned_to,
        description: dbTask.description,
        task_type: dbTask.task_type || 'standard',
        checklist: dbTask.checklist || '[]'
      };
      
      const { data, error } = await supabase
        .from('housekeeping_tasks')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      toast.success('Housekeeping task added successfully');
      return mapDbToHousekeepingTask(data as HousekeepingTaskDB);
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

  async getTasksForToday(): Promise<Array<MaintenanceTask | HousekeepingTask>> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayStr = today.toISOString();
      const tomorrowStr = tomorrow.toISOString();

      const { data: maintenanceTasks, error: maintenanceError } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .gte('due_date', todayStr)
        .lt('due_date', tomorrowStr);

      if (maintenanceError) throw maintenanceError;

      const { data: housekeepingTasks, error: housekeepingError } = await supabase
        .from('housekeeping_tasks')
        .select('*')
        .gte('due_date', todayStr)
        .lt('due_date', tomorrowStr);

      if (housekeepingError) throw housekeepingError;

      const allTasks = [
        ...(maintenanceTasks || []).map(mapDbToMaintenanceTask), 
        ...(housekeepingTasks || []).map((item: any) => mapDbToHousekeepingTask(item as HousekeepingTaskDB))
      ];
      
      return allTasks.sort((a, b) => {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    } catch (error: any) {
      console.error('Error fetching tasks for today:', error);
      return [];
    }
  }
};
