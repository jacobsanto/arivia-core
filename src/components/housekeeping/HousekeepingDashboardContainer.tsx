
import React from "react";
import { useHousekeepingTasks } from "@/hooks/useHousekeepingTasks";
import { useIsMobile } from "@/hooks/use-mobile";
import HousekeepingHeader from "./HousekeepingHeader";
import HousekeepingFilters from "./HousekeepingFilters";
import HousekeepingKanban from "./HousekeepingKanban";
import HousekeepingMobileView from "./HousekeepingMobileView";

const HousekeepingDashboardContainer = () => {
  const {
    tasks,
    loading,
    taskTypeFilter,
    setTaskTypeFilter,
    assignedToFilter,
    setAssignedToFilter,
    dateRange,
    setDateRange,
    taskTypeOptions,
    staffOptions,
    cleaningDefinitions,
    handleTaskStatusUpdate,
    handleAssignTask
  } = useHousekeepingTasks();

  const isMobile = useIsMobile();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pb-20">
      <HousekeepingHeader />
      
      <div className="mb-6">
        <HousekeepingFilters 
          taskTypeFilter={taskTypeFilter}
          setTaskTypeFilter={setTaskTypeFilter}
          assignedToFilter={assignedToFilter}
          setAssignedToFilter={setAssignedToFilter}
          dateRange={dateRange}
          setDateRange={setDateRange}
          taskTypeOptions={taskTypeOptions}
          staffOptions={staffOptions}
        />
      </div>
      
      {tasks.length === 0 ? (
        <div className="bg-muted p-8 rounded-lg text-center">
          <h3 className="text-xl font-medium mb-2">No tasks found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or create new housekeeping tasks
          </p>
        </div>
      ) : (
        <>
          {!isMobile && (
            <HousekeepingKanban 
              tasks={tasks}
              onStatusChange={handleTaskStatusUpdate}
              onAssignTask={handleAssignTask}
              cleaningDefinitions={cleaningDefinitions}
            />
          )}
          
          {isMobile && (
            <HousekeepingMobileView 
              tasks={tasks}
              onStatusChange={handleTaskStatusUpdate}
              onAssignTask={handleAssignTask}
              cleaningDefinitions={cleaningDefinitions}
              isActuallyMobile={true}
            />
          )}
        </>
      )}
    </div>
  );
};

export default HousekeepingDashboardContainer;
