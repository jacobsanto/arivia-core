
import React, { useState } from "react";
import { useMaintenanceTasks } from "@/hooks/useMaintenanceTasks";
import MaintenanceHeader from "@/components/maintenance/MaintenanceHeader";
import MaintenanceList from "@/components/maintenance/MaintenanceList";
import MaintenanceDetail from "@/components/maintenance/MaintenanceDetail";
import MaintenanceReport from "@/components/maintenance/MaintenanceReport";
import MaintenanceCreationForm from "@/components/maintenance/forms/MaintenanceCreationForm";
import MaintenanceFilters from "@/components/maintenance/MaintenanceFilters";
import MaintenanceStats from "@/components/maintenance/stats/MaintenanceStats";
import MaintenanceHistory from "@/components/maintenance/MaintenanceHistory";
import MaintenanceReporting from "@/components/maintenance/reporting/MaintenanceReporting";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DateRangeFilter } from "@/types/maintenanceTypes";
import { useReports } from "@/hooks/useReports";
import { Loader2 } from "lucide-react";

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
    dateRangeFilter,
    setDateRange,
    handleOpenTask,
    handleCloseTask,
    handleCompleteTask,
    handlePhotoUpload,
    handleVideoUpload,
    isReportOpen,
    setIsReportOpen,
    handleSubmitReport,
    currentReport,
    handleToggleInstruction,
    handleCreateTask,
  } = useMaintenanceTasks();

  const [viewMode, setViewMode] = useState<"list" | "stats" | "history">("list");
  const [isReportingOpen, setIsReportingOpen] = useState(false);
  const [isReportingLoading, setIsReportingLoading] = useState(false);

  const { isLoading: reportsLoading } = useReports('maintenance');

  const handleClearFilters = () => {
    setSearchQuery("");
    setActiveTab("all");
    setPropertyFilter("all");
    setPriorityFilter("all");
    setDateRange({ startDate: null, endDate: null });
  };

  const handleViewReports = () => {
    setIsReportingOpen(true);
    setIsReportingLoading(true);
    setTimeout(() => {
      setIsReportingLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <MaintenanceHeader 
        onCreateTask={() => setIsCreateTaskOpen(true)} 
        onViewReports={handleViewReports}
      />

      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "list" | "stats" | "history")} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Task List</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
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

        <TabsContent value="history">
          <MaintenanceHistory 
            tasks={filteredTasks}
            dateRangeFilter={dateRangeFilter}
            onDateRangeChange={setDateRange}
            onClearFilters={handleClearFilters}
            onOpenTask={handleOpenTask}
          />
        </TabsContent>
      </Tabs>

      {selectedTask && (
        <MaintenanceDetail
          task={selectedTask}
          onClose={handleCloseTask}
          onComplete={() => setIsReportOpen(true)}
          onPhotoUpload={handlePhotoUpload}
          onVideoUpload={handleVideoUpload}
          onToggleInstruction={handleToggleInstruction}
        />
      )}

      {selectedTask && isReportOpen && (
        <MaintenanceReport
          task={selectedTask}
          onClose={() => setIsReportOpen(false)}
          onSubmit={handleSubmitReport}
          report={currentReport}
        />
      )}

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

      <Dialog open={isReportingOpen} onOpenChange={setIsReportingOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="flex items-center">
              Maintenance Reports
              {isReportingLoading && (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              )}
            </DialogTitle>
          </DialogHeader>
          <MaintenanceReporting />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Maintenance;
