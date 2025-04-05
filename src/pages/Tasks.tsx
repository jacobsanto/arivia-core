
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Import task components
import TaskHeader from "@/components/tasks/TaskHeader";
import TaskList from "@/components/tasks/TaskList";
import TaskDetail from "@/components/tasks/TaskDetail";
import TaskCreationForm from "@/components/tasks/TaskCreationForm";
import TaskFilters from "@/components/tasks/TaskFilters";
import { useTasks } from "@/hooks/useTasks";

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
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <TaskCreationForm 
            onSubmit={handleCreateTask} 
            onCancel={() => setIsCreateTaskOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tasks;
