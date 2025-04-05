
import React from "react";
import { useMaintenanceTasks } from "@/hooks/useMaintenanceTasks";
import MaintenanceHeader from "@/components/maintenance/MaintenanceHeader";
import MaintenanceList from "@/components/maintenance/MaintenanceList";
import MaintenanceDetail from "@/components/maintenance/MaintenanceDetail";
import MaintenanceReport from "@/components/maintenance/MaintenanceReport";
import MaintenanceCreationForm from "@/components/maintenance/MaintenanceCreationForm";
import MaintenanceFilters from "@/components/maintenance/MaintenanceFilters";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Maintenance = () => {
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
    priorityFilter,
    setPriorityFilter,
    handleOpenTask,
    handleCloseTask,
    handleCompleteTask,
    handleCreateTask,
    handlePhotoUpload,
    isReportOpen,
    setIsReportOpen,
    handleSubmitReport,
    currentReport,
  } = useMaintenanceTasks();

  return (
    <div className="space-y-6">
      <MaintenanceHeader onCreateTask={() => setIsCreateTaskOpen(true)} />

      <MaintenanceFilters 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onPropertyFilter={setPropertyFilter}
        onPriorityFilter={setPriorityFilter}
      />

      <MaintenanceList
        tasks={filteredTasks}
        onOpenTask={handleOpenTask}
      />

      {/* Maintenance Detail Modal */}
      {selectedTask && (
        <MaintenanceDetail
          task={selectedTask}
          onClose={handleCloseTask}
          onComplete={() => setIsReportOpen(true)}
          onPhotoUpload={handlePhotoUpload}
        />
      )}

      {/* Maintenance Report Modal */}
      {selectedTask && isReportOpen && (
        <MaintenanceReport
          task={selectedTask}
          onClose={() => setIsReportOpen(false)}
          onSubmit={handleSubmitReport}
          report={currentReport}
        />
      )}

      {/* Create Maintenance Task Dialog */}
      <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Maintenance Task</DialogTitle>
          </DialogHeader>
          <MaintenanceCreationForm 
            onSubmit={handleCreateTask} 
            onCancel={() => setIsCreateTaskOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Maintenance;
