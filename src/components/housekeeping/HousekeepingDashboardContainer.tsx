
import React from "react";
import { useHousekeepingTasks } from "@/hooks/useHousekeepingTasks";
import { useIsMobile } from "@/hooks/use-mobile";
import HousekeepingHeader from "./HousekeepingHeader";
import HousekeepingFilters from "./HousekeepingFilters";
import HousekeepingKanban from "./HousekeepingKanban";
import HousekeepingMobileView from "./HousekeepingMobileView";
import HousekeepingTaskCard from "./HousekeepingTaskCard";
import HousekeepingListView from "./views/HousekeepingListView";
import HousekeepingAgendaView from "./views/HousekeepingAgendaView";
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
    handleAssignTask,
    refetch
  } = useHousekeepingTasks();

  const isMobile = useIsMobile();

  const [viewMode, setViewMode] = React.useState<'kanban' | 'card' | 'list' | 'agenda'>('kanban');
  const [refreshing, setRefreshing] = React.useState(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // viewMode state moved above loading guard

  return (
    <div className="container mx-auto px-4 pb-20">
      <HousekeepingHeader 
        viewMode={viewMode} 
        onViewModeChange={setViewMode}
        refreshing={refreshing}
        onRefresh={async () => {
          try {
            setRefreshing(true);
            await refetch();
          } finally {
            setRefreshing(false);
          }
        }}
      />
      
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
            <>
              {viewMode === 'kanban' && (
                <HousekeepingKanban 
                  tasks={tasks}
                  onStatusChange={handleTaskStatusUpdate}
                  onAssignTask={handleAssignTask}
                  cleaningDefinitions={cleaningDefinitions}
                />
              )}
              {viewMode === 'card' && (
                <div className="grid grid-cols-1 gap-3">
                  {tasks.map((task) => (
                    <HousekeepingTaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={handleTaskStatusUpdate}
                      onAssignTask={handleAssignTask}
                      cleaningDefinitions={cleaningDefinitions}
                    />
                  ))}
                </div>
              )}
              {viewMode === 'list' && (
                <HousekeepingListView
                  tasks={tasks}
                  onStatusChange={handleTaskStatusUpdate}
                  onAssignTask={handleAssignTask}
                />
              )}
              {viewMode === 'agenda' && (
                <HousekeepingAgendaView tasks={tasks} />
              )}
            </>
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
