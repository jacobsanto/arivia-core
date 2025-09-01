import { useState, useMemo, useCallback } from 'react';
import { 
  MaintenanceTaskEnhanced, 
  MaintenanceFilters, 
  MaintenanceViewMode,
  MaintenanceSort,
  MaintenanceAgendaGroup,
  MaintenanceStats,
  CreateMaintenanceTaskData
} from '@/types/maintenance-enhanced.types';
import { tasksService } from '@/services/tasks/tasks.service';
import { toast } from 'sonner';
import { format, isToday, isTomorrow, isPast, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

// Mock data for development - replace with real data service calls
const mockMaintenanceTasks: MaintenanceTaskEnhanced[] = [
  {
    id: '1',
    title: 'Fix leaking faucet in master bathroom',
    description: 'Guest reported water dripping from the main bathroom faucet. Needs immediate attention.',
    property: {
      id: 'prop-1',
      name: 'Villa Aurora',
      address: 'Mykonos, Greece'
    },
    assignee: {
      id: 'user-1',
      name: 'Nikos Papadopoulos',
      avatar: '/avatars/nikos.jpg',
      role: 'Maintenance Technician'
    },
    taskType: 'repair',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2024-01-15T10:00:00Z',
    scheduledDate: '2024-01-15T09:00:00Z',
    estimatedCost: 150,
    estimatedDuration: 120,
    location: 'Master Bathroom',
    room: 'Bathroom #1',
    photos: [
      {
        id: 'photo-1',
        url: '/maintenance/leak-before.jpg',
        caption: 'Water damage visible',
        uploadedAt: '2024-01-14T14:30:00Z',
        uploadedBy: 'user-2',
        type: 'before'
      }
    ],
    checklist: [
      { id: 1, title: 'Turn off water supply', completed: true, completedAt: '2024-01-15T09:15:00Z', completedBy: 'user-1' },
      { id: 2, title: 'Remove old faucet', completed: true, completedAt: '2024-01-15T09:45:00Z', completedBy: 'user-1' },
      { id: 3, title: 'Install new faucet', completed: false },
      { id: 4, title: 'Test water pressure', completed: false },
      { id: 5, title: 'Clean work area', completed: false }
    ],
    comments: [
      {
        id: 'comment-1',
        userId: 'user-2',
        userName: 'Maria Kostas',
        message: 'Guest mentioned this started yesterday evening',
        createdAt: '2024-01-14T14:30:00Z',
        type: 'comment'
      }
    ],
    requiredTools: ['Wrench Set', 'Plumbers Tape', 'Screwdriver'],
    requiredMaterials: [
      { name: 'Chrome Faucet', quantity: 1, estimatedCost: 120 },
      { name: 'Plumbers Putty', quantity: 1, estimatedCost: 15 }
    ],
    purchaseOrderId: 'po-2024-001',
    tags: ['plumbing', 'urgent', 'guest-impact'],
    createdAt: '2024-01-14T14:30:00Z',
    updatedAt: '2024-01-15T09:45:00Z'
  },
  {
    id: '2',
    title: 'Annual HVAC System Inspection',
    description: 'Scheduled annual maintenance and inspection of all HVAC units',
    property: {
      id: 'prop-2',
      name: 'Villa Eros',
      address: 'Santorini, Greece'
    },
    assignee: {
      id: 'user-3',
      name: 'Dimitri Stavros',
      avatar: '/avatars/dimitri.jpg',
      role: 'HVAC Specialist'
    },
    taskType: 'inspection',
    status: 'scheduled',
    priority: 'normal',
    dueDate: '2024-01-20T14:00:00Z',
    scheduledDate: '2024-01-20T14:00:00Z',
    estimatedCost: 300,
    estimatedDuration: 240,
    location: 'All Units',
    photos: [],
    checklist: [
      { id: 1, title: 'Check air filters', completed: false },
      { id: 2, title: 'Inspect ductwork', completed: false },
      { id: 3, title: 'Test thermostat calibration', completed: false },
      { id: 4, title: 'Check refrigerant levels', completed: false },
      { id: 5, title: 'Clean condenser coils', completed: false }
    ],
    comments: [],
    requiredTools: ['HVAC Manifold', 'Digital Thermometer', 'Vacuum Pump'],
    requiredMaterials: [
      { name: 'Air Filters (Set)', quantity: 4, estimatedCost: 80 },
      { name: 'Refrigerant R410A', quantity: 2, estimatedCost: 120 }
    ],
    recurringTaskId: 'recurring-hvac-001',
    isRecurring: true,
    nextRecurrence: '2025-01-20T14:00:00Z',
    tags: ['hvac', 'preventive', 'annual'],
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z'
  },
  {
    id: '3',
    title: 'Repair damaged pool tile',
    description: 'Several pool tiles are cracked and need replacement before next guest arrival',
    property: {
      id: 'prop-1',
      name: 'Villa Aurora',
      address: 'Mykonos, Greece'
    },
    taskType: 'repair',
    status: 'pending',
    priority: 'urgent',
    dueDate: '2024-01-16T12:00:00Z',
    estimatedCost: 250,
    estimatedDuration: 180,
    location: 'Pool Area',
    photos: [
      {
        id: 'photo-2',
        url: '/maintenance/pool-damage.jpg',
        caption: 'Cracked tiles near diving area',
        uploadedAt: '2024-01-14T16:00:00Z',
        uploadedBy: 'user-4',
        type: 'before'
      }
    ],
    checklist: [
      { id: 1, title: 'Drain pool partially', completed: false },
      { id: 2, title: 'Remove damaged tiles', completed: false },
      { id: 3, title: 'Clean and prep surface', completed: false },
      { id: 4, title: 'Install new tiles', completed: false },
      { id: 5, title: 'Apply grout and seal', completed: false }
    ],
    comments: [
      {
        id: 'comment-2',
        userId: 'user-4',
        userName: 'Housekeeping Team',
        message: 'Noticed during routine cleaning, guest checking in tomorrow',
        createdAt: '2024-01-14T16:00:00Z',
        type: 'comment'
      }
    ],
    requiredTools: ['Tile Cutter', 'Grout Float', 'Rubber Mallet'],
    requiredMaterials: [
      { name: 'Pool Tiles (Blue)', quantity: 6, estimatedCost: 180 },
      { name: 'Waterproof Grout', quantity: 1, estimatedCost: 45 }
    ],
    tags: ['pool', 'urgent', 'guest-arrival'],
    createdAt: '2024-01-14T16:00:00Z',
    updatedAt: '2024-01-14T16:00:00Z'
  }
];

export const useMaintenanceEnhanced = () => {
  // State management
  const [tasks] = useState<MaintenanceTaskEnhanced[]>(mockMaintenanceTasks);
  const [viewMode, setViewMode] = useState<MaintenanceViewMode>('grid');
  const [selectedTask, setSelectedTask] = useState<MaintenanceTaskEnhanced | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  
  // Filters and sorting
  const [filters, setFilters] = useState<MaintenanceFilters>({
    search: '',
    property: 'all',
    assignee: 'all',
    status: 'all',
    priority: 'all',
    taskType: 'all',
    dateRange: {
      startDate: null,
      endDate: null,
    },
    tags: [],
  });
  
  const [sort, setSort] = useState<MaintenanceSort>({
    field: 'dueDate',
    direction: 'asc',
  });

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower) ||
          task.property.name.toLowerCase().includes(searchLower) ||
          task.assignee?.name.toLowerCase().includes(searchLower) ||
          task.location?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Property filter
      if (filters.property !== 'all' && task.property.id !== filters.property) {
        return false;
      }

      // Assignee filter
      if (filters.assignee !== 'all' && task.assignee?.id !== filters.assignee) {
        return false;
      }

      // Status filter
      if (filters.status !== 'all' && task.status !== filters.status) {
        return false;
      }

      // Priority filter
      if (filters.priority !== 'all' && task.priority !== filters.priority) {
        return false;
      }

      // Task type filter
      if (filters.taskType !== 'all' && task.taskType !== filters.taskType) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.startDate && filters.dateRange.endDate && task.dueDate) {
        const taskDate = new Date(task.dueDate);
        const inRange = isWithinInterval(taskDate, {
          start: startOfDay(filters.dateRange.startDate),
          end: endOfDay(filters.dateRange.endDate),
        });
        if (!inRange) return false;
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag => task.tags.includes(tag));
        if (!hasMatchingTag) return false;
      }

      // Special filters
      if (filters.hasPhotos && task.photos.length === 0) {
        return false;
      }

      if (filters.hasPurchaseOrder && !task.purchaseOrderId) {
        return false;
      }

      if (filters.isOverdue && task.dueDate) {
        const isOverdue = isPast(new Date(task.dueDate)) && task.status !== 'completed';
        if (!isOverdue) return false;
      }

      if (filters.needsQC && task.qcStatus !== 'pending') {
        return false;
      }

      return true;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let valueA: any, valueB: any;

      switch (sort.field) {
        case 'title':
          valueA = a.title;
          valueB = b.title;
          break;
        case 'property':
          valueA = a.property.name;
          valueB = b.property.name;
          break;
        case 'assignee':
          valueA = a.assignee?.name || '';
          valueB = b.assignee?.name || '';
          break;
        case 'dueDate':
          valueA = a.dueDate ? new Date(a.dueDate) : new Date('9999-12-31');
          valueB = b.dueDate ? new Date(b.dueDate) : new Date('9999-12-31');
          break;
        case 'priority':
          const priorityOrder = { 'urgent': 4, 'high': 3, 'normal': 2, 'low': 1 };
          valueA = priorityOrder[a.priority];
          valueB = priorityOrder[b.priority];
          break;
        case 'status':
          valueA = a.status;
          valueB = b.status;
          break;
        case 'createdAt':
          valueA = new Date(a.createdAt);
          valueB = new Date(b.createdAt);
          break;
        case 'estimatedCost':
          valueA = a.estimatedCost || 0;
          valueB = b.estimatedCost || 0;
          break;
        default:
          return 0;
      }

      if (valueA < valueB) return sort.direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [tasks, filters, sort]);

  // Agenda groups for agenda view
  const agendaGroups = useMemo((): MaintenanceAgendaGroup[] => {
    const groups: MaintenanceAgendaGroup[] = [];
    const now = new Date();

    // Group tasks by time periods
    const overdue = filteredTasks.filter(task => 
      task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'completed'
    );

    const today = filteredTasks.filter(task => 
      task.dueDate && isToday(new Date(task.dueDate))
    );

    const tomorrow = filteredTasks.filter(task => 
      task.dueDate && isTomorrow(new Date(task.dueDate))
    );

    const upcoming = filteredTasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate > now && !isToday(taskDate) && !isTomorrow(taskDate);
    });

    const noDate = filteredTasks.filter(task => !task.dueDate);

    if (overdue.length > 0) {
      groups.push({
        key: 'overdue',
        title: 'Overdue',
        count: overdue.length,
        tasks: overdue,
        isOverdue: true,
      });
    }

    if (today.length > 0) {
      groups.push({
        key: 'today',
        title: 'Today',
        count: today.length,
        tasks: today,
        isToday: true,
      });
    }

    if (tomorrow.length > 0) {
      groups.push({
        key: 'tomorrow',
        title: 'Tomorrow',
        count: tomorrow.length,
        tasks: tomorrow,
      });
    }

    if (upcoming.length > 0) {
      groups.push({
        key: 'upcoming',
        title: 'Upcoming',
        count: upcoming.length,
        tasks: upcoming,
      });
    }

    if (noDate.length > 0) {
      groups.push({
        key: 'no-date',
        title: 'No Due Date',
        count: noDate.length,
        tasks: noDate,
      });
    }

    return groups;
  }, [filteredTasks]);

  // Statistics
  const stats = useMemo((): MaintenanceStats => {
    const now = new Date();
    
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const overdueTasks = tasks.filter(t => 
      t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'completed'
    );

    const totalCost = tasks.reduce((sum, task) => sum + (task.actualCost || task.estimatedCost || 0), 0);
    
    const avgCompletionTime = completedTasks.length > 0
      ? completedTasks.reduce((sum, task) => {
          if (task.actualDuration) return sum + task.actualDuration;
          return sum + (task.estimatedDuration || 0);
        }, 0) / completedTasks.length
      : 0;

    const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      completed: completedTasks.length,
      overdue: overdueTasks.length,
      urgent: tasks.filter(t => t.priority === 'urgent').length,
      totalCost,
      avgCompletionTime,
      completionRate,
    };
  }, [tasks]);

  // Actions
  const handleCreateTask = useCallback(async (data: CreateMaintenanceTaskData) => {
    try {
      // In a real app, this would call the API
      console.log('Creating maintenance task:', data);
      toast.success('Maintenance task created successfully!');
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create maintenance task');
    }
  }, []);

  const handleUpdateTask = useCallback(async (taskId: string, updates: Partial<MaintenanceTaskEnhanced>) => {
    try {
      // In a real app, this would call the API
      console.log('Updating task:', taskId, updates);
      toast.success('Task updated successfully!');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  }, []);

  const handleDeleteTask = useCallback(async (taskId: string) => {
    try {
      // In a real app, this would call the API
      console.log('Deleting task:', taskId);
      toast.success('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  }, []);

  const openTaskDetails = useCallback((task: MaintenanceTaskEnhanced) => {
    setSelectedTask(task);
    setIsTaskDetailsOpen(true);
  }, []);

  const closeTaskDetails = useCallback(() => {
    setSelectedTask(null);
    setIsTaskDetailsOpen(false);
  }, []);

  const updateFilters = useCallback((newFilters: Partial<MaintenanceFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const updateSort = useCallback((newSort: MaintenanceSort) => {
    setSort(newSort);
  }, []);

  return {
    // Data
    tasks: filteredTasks,
    allTasks: tasks,
    selectedTask,
    stats,
    agendaGroups,

    // UI State
    viewMode,
    setViewMode,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isTaskDetailsOpen,

    // Filters & Sorting
    filters,
    updateFilters,
    sort,
    updateSort,

    // Actions
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    openTaskDetails,
    closeTaskDetails,
  };
};