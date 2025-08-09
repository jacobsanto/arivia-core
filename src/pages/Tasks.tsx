
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

// Import task components
import TaskHeader from "@/components/tasks/TaskHeader";
import TaskList from "@/components/tasks/TaskList";
import TaskDetail from "@/components/tasks/TaskDetail";
import TaskCreationForm from "@/components/tasks/TaskCreationForm";
import TaskFilters from "@/components/tasks/TaskFilters";
import GenericTaskListView from "@/components/tasks/views/GenericTaskListView";
import GenericTaskAgendaView from "@/components/tasks/views/GenericTaskAgendaView";
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

  const [viewMode, setViewMode] = React.useState<'card' | 'list' | 'agenda'>('card');

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

      <div className="flex justify-end gap-2">
        <Button size="sm" variant={viewMode === 'card' ? 'default' : 'outline'} onClick={() => setViewMode('card')}>Card</Button>
        <Button size="sm" variant={viewMode === 'list' ? 'default' : 'outline'} onClick={() => setViewMode('list')}>List</Button>
        <Button size="sm" variant={viewMode === 'agenda' ? 'default' : 'outline'} onClick={() => setViewMode('agenda')}>Agenda</Button>
      </div>

      {viewMode === 'card' ? (
        <TaskList tasks={filteredTasks} onOpenTask={handleOpenTask} />
      ) : viewMode === 'list' ? (
        <GenericTaskListView tasks={filteredTasks} onOpenTask={handleOpenTask} />
      ) : (
        <GenericTaskAgendaView tasks={filteredTasks} onOpenTask={handleOpenTask} />
      )}

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
