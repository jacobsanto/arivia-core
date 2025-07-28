import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Clock, User, MapPin, MessageSquare, Paperclip, ArrowUpDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdvancedTaskFilters } from "@/hooks/useAdvancedTaskFilters";
import TaskFilters from "../advanced/TaskFilters";
import TaskComments from "../advanced/TaskComments";
import TaskAttachments from "../advanced/TaskAttachments";
import { format } from "date-fns";

interface EnhancedTask {
  id: string;
  title?: string;
  description?: string;
  status: string;
  priority?: string;
  assigned_to?: string;
  listing_id?: string;
  task_type?: string;
  due_date: string;
  created_at: string;
  booking_id?: string;
}

const EnhancedTaskList = () => {
  const [tasks, setTasks] = useState<EnhancedTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<EnhancedTask | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const {
    filters,
    updateFilter,
    clearFilters,
    filteredAndSortedTasks,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    activeFiltersCount,
  } = useAdvancedTaskFilters(tasks);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      // Fetch both housekeeping and maintenance tasks
      const [housekeepingResponse, maintenanceResponse] = await Promise.all([
        supabase
          .from("housekeeping_tasks")
          .select("*")
          .order("due_date", { ascending: true }),
        supabase
          .from("maintenance_tasks")
          .select("*")
          .order("due_date", { ascending: true })
      ]);

      if (housekeepingResponse.error) throw housekeepingResponse.error;
      if (maintenanceResponse.error) throw maintenanceResponse.error;

      // Combine and normalize the tasks
      const combinedTasks: EnhancedTask[] = [
        ...(housekeepingResponse.data || []).map(task => ({
          ...task,
          title: task.description || task.task_type,
          priority: "normal", // Default priority for housekeeping tasks
        })),
        ...(maintenanceResponse.data || []).map(task => ({
          ...task,
          listing_id: task.property_id,
          title: task.title,
        }))
      ];

      setTasks(combinedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string, isMaintenanceTask: boolean) => {
    try {
      const table = isMaintenanceTask ? "maintenance_tasks" : "housekeeping_tasks";
      const { error } = await supabase
        .from(table)
        .update({ status: newStatus })
        .eq("id", taskId);

      if (error) throw error;

      await fetchTasks();
      toast({
        title: "Task updated",
        description: `Task status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "in_progress":
      case "in progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case "urgent":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "normal":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    return new Date(dueDate) < new Date() && status !== "completed";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Enhanced Task Management</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            <ArrowUpDown className="h-4 w-4 mr-1" />
            {sortOrder === "asc" ? "Oldest First" : "Newest First"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <TaskFilters
        searchQuery={filters.searchQuery}
        onSearchChange={(value) => updateFilter("searchQuery", value)}
        statusFilter={filters.statusFilter}
        onStatusChange={(value) => updateFilter("statusFilter", value)}
        priorityFilter={filters.priorityFilter}
        onPriorityChange={(value) => updateFilter("priorityFilter", value)}
        assigneeFilter={filters.assigneeFilter}
        onAssigneeChange={(value) => updateFilter("assigneeFilter", value)}
        propertyFilter={filters.propertyFilter}
        onPropertyChange={(value) => updateFilter("propertyFilter", value)}
        taskTypeFilter={filters.taskTypeFilter}
        onTaskTypeChange={(value) => updateFilter("taskTypeFilter", value)}
        onClearFilters={clearFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSortedTasks.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No tasks found matching your filters.</p>
          </div>
        ) : (
          filteredAndSortedTasks.map((task) => (
            <Card
              key={task.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isOverdue(task.due_date, task.status) ? "border-red-200 bg-red-50/50" : ""
              }`}
              onClick={() => setSelectedTask(task)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-medium line-clamp-2">
                    {task.title || task.task_type || "Untitled Task"}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Badge className={getStatusColor(task.status)} variant="secondary">
                      {task.status}
                    </Badge>
                    {task.priority && (
                      <Badge className={getPriorityColor(task.priority)} variant="secondary">
                        {task.priority}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {task.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {task.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(task.due_date), "MMM d")}
                    {isOverdue(task.due_date, task.status) && (
                      <span className="text-red-600 font-medium">(Overdue)</span>
                    )}
                  </div>
                  
                  {task.assigned_to && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Assigned
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {task.listing_id && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {task.listing_id.slice(0, 8)}...
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {task.task_type || "Task"}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                    >
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Comments
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                    >
                      <Paperclip className="h-3 w-3 mr-1" />
                      Files
                    </Button>
                  </div>
                  
                  {task.status !== "completed" && (
                    <Button
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        const isMaintenanceTask = 'property_id' in task;
                        updateTaskStatus(task.id, "completed", isMaintenanceTask);
                      }}
                    >
                      Complete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{selectedTask.title || selectedTask.task_type || "Task Details"}</span>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(selectedTask.status)} variant="secondary">
                    {selectedTask.status}
                  </Badge>
                  {selectedTask.priority && (
                    <Badge className={getPriorityColor(selectedTask.priority)} variant="secondary">
                      {selectedTask.priority}
                    </Badge>
                  )}
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <TaskComments
                  taskId={selectedTask.id}
                  taskType={selectedTask.booking_id ? "housekeeping" : "maintenance"}
                />
              </div>
              <div className="space-y-4">
                <TaskAttachments
                  taskId={selectedTask.id}
                  taskType={selectedTask.booking_id ? "housekeeping" : "maintenance"}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EnhancedTaskList;
