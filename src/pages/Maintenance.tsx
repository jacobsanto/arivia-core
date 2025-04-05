
import React, { useState } from "react";
import { useMaintenanceTasks } from "@/hooks/useMaintenanceTasks";
import MaintenanceHeader from "@/components/maintenance/MaintenanceHeader";
import MaintenanceList from "@/components/maintenance/MaintenanceList";
import MaintenanceDetail from "@/components/maintenance/MaintenanceDetail";
import MaintenanceReport from "@/components/maintenance/MaintenanceReport";
import MaintenanceCreationForm from "@/components/maintenance/forms/MaintenanceCreationForm";
import MaintenanceFilters from "@/components/maintenance/MaintenanceFilters";
import MaintenanceStats from "@/components/maintenance/MaintenanceStats";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const Maintenance = () => {
  const {
    tasks,
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
    handlePhotoUpload,
    isReportOpen,
    setIsReportOpen,
    handleSubmitReport,
    currentReport,
    handleToggleInstruction,
    handleCreateTask,
  } = useMaintenanceTasks();

  const [viewMode, setViewMode] = useState<"list" | "stats">("list");

  return (
    <div className="space-y-6">
      <MaintenanceHeader onCreateTask={() => setIsCreateTaskOpen(true)} />

      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "list" | "stats")} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Task List</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="stats">
          <MaintenanceStats tasks={tasks} />
        </TabsContent>
      </Tabs>

      {/* Maintenance Detail Modal */}
      {selectedTask && (
        <MaintenanceDetail
          task={selectedTask}
          onClose={handleCloseTask}
          onComplete={() => setIsReportOpen(true)}
          onPhotoUpload={handlePhotoUpload}
          onToggleInstruction={handleToggleInstruction}
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
