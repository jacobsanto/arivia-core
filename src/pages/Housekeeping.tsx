import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";

// Import housekeeping components
import TaskHeader from "@/components/tasks/TaskHeader";
import TaskList from "@/components/tasks/TaskList";
import TaskDetail from "@/components/tasks/TaskDetail";
import TaskCreationForm from "@/components/tasks/TaskCreationForm";
import TaskFilters from "@/components/tasks/TaskFilters";
import { useTasks } from "@/hooks/useTasks";
import { useIsMobile } from "@/hooks/use-mobile";
import TaskReporting from "@/components/tasks/TaskReporting";
const Housekeeping = () => {
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
    isReportingOpen,
    setIsReportingOpen,
    handleOpenTask,
    handleCloseTask,
    handleCompleteTask,
    handleApproveTask,
    handleRejectTask,
    handleToggleChecklistItem,
    handleCreateTask,
    handlePhotoUpload
  } = useTasks();
  const isMobile = useIsMobile();
  return <div className="space-y-6">
      <TaskHeader onCreateTask={() => setIsCreateTaskOpen(true)} onViewReports={() => setIsReportingOpen(true)} />

      

      <TaskFilters searchQuery={searchQuery} onSearchChange={setSearchQuery} activeTab={activeTab} onTabChange={setActiveTab} onPropertyFilter={setPropertyFilter} onTypeFilter={setTypeFilter} />

      <TaskList tasks={filteredTasks} onOpenTask={handleOpenTask} />

      {/* Task Detail Modal - Sheet on mobile, Dialog on desktop */}
      {selectedTask && isMobile ? <Sheet open={!!selectedTask} onOpenChange={() => selectedTask && handleCloseTask()}>
          <SheetContent className="overflow-y-auto h-[85vh] pt-6" side="bottom">
            <TaskDetail task={selectedTask} onClose={handleCloseTask} onComplete={handleCompleteTask} onApprove={handleApproveTask} onReject={handleRejectTask} onToggleChecklistItem={handleToggleChecklistItem} onPhotoUpload={handlePhotoUpload} />
          </SheetContent>
        </Sheet> : selectedTask && <TaskDetail task={selectedTask} onClose={handleCloseTask} onComplete={handleCompleteTask} onApprove={handleApproveTask} onReject={handleRejectTask} onToggleChecklistItem={handleToggleChecklistItem} onPhotoUpload={handlePhotoUpload} />}

      {/* Create Task Dialog */}
      <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
        <DialogContent className={isMobile ? "sm:max-w-none" : "sm:max-w-[600px]"}>
          <DialogHeader>
            <DialogTitle>Create New Housekeeping Task</DialogTitle>
          </DialogHeader>
          <TaskCreationForm onSubmit={handleCreateTask} onCancel={() => setIsCreateTaskOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Reporting Dialog */}
      <Dialog open={isReportingOpen} onOpenChange={setIsReportingOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Housekeeping Performance Reports</DialogTitle>
          </DialogHeader>
          <TaskReporting />
        </DialogContent>
      </Dialog>
    </div>;
};
export default Housekeeping;