
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

// Import task components
import TaskHeader from "@/components/tasks/TaskHeader";
import TaskList from "@/components/tasks/TaskList";
import TaskDetail from "@/components/tasks/TaskDetail";
import TaskCreationForm from "@/components/tasks/TaskCreationForm";
import TaskFilters from "@/components/tasks/TaskFilters";
import { useTasks } from "@/hooks/useTasks";
import { FloatingActionButton } from "@/components/ui/floating-action-button";

const Tasks = () => {
  const {
    filteredTasks,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    selectedTask,
    isCreateTaskOpen,
    setIsCreateTaskOpen,
    propertyFilter,
    setPropertyFilter,
    typeFilter,
    setTypeFilter,
    handleOpenTask,
    handleCloseTask,
    handleCompleteTask,
    handleToggleChecklistItem,
    handleCreateTask,
    handlePhotoUpload,
  } = useTasks();

  return (
    <div className="space-y-6">
      <TaskHeader onCreateTask={() => setIsCreateTaskOpen(true)} />

      <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
        <p className="text-amber-800 text-sm">
          <strong>Note:</strong> This module is for housekeeping tasks only. For maintenance and repair tasks, please use the 
          <a href="/maintenance" className="text-blue-600 font-medium underline mx-1">Maintenance module</a>.
        </p>
      </div>

      <TaskFilters 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onPropertyFilter={setPropertyFilter}
        onTypeFilter={setTypeFilter}
      />

      <TaskList
        tasks={filteredTasks}
        onOpenTask={handleOpenTask}
      />

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={handleCloseTask}
          onComplete={handleCompleteTask}
          onToggleChecklistItem={handleToggleChecklistItem}
          onPhotoUpload={handlePhotoUpload}
        />
      )}

      {/* Create Task Dialog */}
      <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Housekeeping Task</DialogTitle>
          </DialogHeader>
          <TaskCreationForm 
            onSubmit={handleCreateTask} 
            onCancel={() => setIsCreateTaskOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      <FloatingActionButton
        actions={[{
          icon: <Plus className="h-5 w-5" />,
          label: "Create Task",
          onClick: () => setIsCreateTaskOpen(true)
        }]}
      />
    </div>
  );
};

export default Tasks;
