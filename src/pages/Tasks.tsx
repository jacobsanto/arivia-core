import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, List, CalendarClock, Rows4 } from "lucide-react";

// Import task components
import TaskDetail from "@/components/tasks/TaskDetail";
import TaskCreationForm from "@/components/tasks/TaskCreationForm";
import TaskFilters from "@/components/tasks/TaskFilters";
import TaskList from "@/components/tasks/TaskList";
import GenericTaskListView from "@/components/tasks/views/GenericTaskListView";
import GenericTaskAgendaView from "@/components/tasks/views/GenericTaskAgendaView";
import { useTasks } from "@/hooks/useTasks";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { Helmet } from "react-helmet-async";

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
    <>
      <Helmet>
        <title>Task Management - Arivia Villas</title>
        <meta name="description" content="Manage and track housekeeping tasks across all properties with our comprehensive task management system." />
        <meta name="keywords" content="task management, housekeeping, property management, cleaning tasks, maintenance" />
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Task Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage housekeeping tasks across all properties
            </p>
          </div>
          
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Mobile view mode selector */}
            <div className="sm:hidden">
              <select 
                value={viewMode} 
                onChange={(e) => setViewMode(e.target.value as 'card' | 'list' | 'agenda')}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="card">Card</option>
                <option value="list">List</option>
                <option value="agenda">Agenda</option>
              </select>
            </div>
            
            {/* Desktop view mode buttons */}
            <div className="hidden sm:flex items-center gap-1 mr-2">
              <Button size="sm" variant={viewMode === 'card' ? 'default' : 'outline'} onClick={() => setViewMode('card')}>
                <Rows4 className="h-4 w-4 mr-1" /> Card
              </Button>
              <Button size="sm" variant={viewMode === 'list' ? 'default' : 'outline'} onClick={() => setViewMode('list')}>
                <List className="h-4 w-4 mr-1" /> List
              </Button>
              <Button size="sm" variant={viewMode === 'agenda' ? 'default' : 'outline'} onClick={() => setViewMode('agenda')}>
                <CalendarClock className="h-4 w-4 mr-1" /> Agenda
              </Button>
            </div>
            <Button onClick={() => setIsCreateTaskOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Create Task</span>
            </Button>
          </div>
        </div>

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
    </>
  );
};

export default Tasks;