import React, { useState } from "react";
import MaintenanceHeader from "@/components/maintenance/MaintenanceHeader";
import MaintenanceFilters from "@/components/maintenance/MaintenanceFilters";
import MaintenanceList from "@/components/maintenance/MaintenanceList";
import MaintenanceKanban from "@/components/maintenance/MaintenanceKanban";
import { useMaintenanceTasks } from "@/hooks/useMaintenanceTasks";
import { Button } from "@/components/ui/button";

const MaintenanceDashboardContainer: React.FC = () => {
  const {
    filteredTasks,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    propertyFilter,
    setPropertyFilter,
    priorityFilter,
    setPriorityFilter,
    setIsCreateTaskOpen,
    handleOpenTask,
  } = useMaintenanceTasks();

  const [viewMode, setViewMode] = useState<"kanban" | "card" | "list" | "agenda">("kanban");

  return (
    <div className="space-y-5">
      <header>
        <MaintenanceHeader onCreateTask={() => setIsCreateTaskOpen(true)} />
      </header>

      <section>
        <MaintenanceFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onPropertyFilter={setPropertyFilter}
          onPriorityFilter={setPriorityFilter}
        />
      </section>

      <section className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {filteredTasks.length} task{filteredTasks.length === 1 ? "" : "s"}
        </div>
        <div className="flex gap-2">
          <Button variant={viewMode === "kanban" ? "default" : "outline"} onClick={() => setViewMode("kanban")}>Kanban</Button>
          <Button variant={viewMode === "card" ? "default" : "outline"} onClick={() => setViewMode("card")}>Card</Button>
          <Button variant={viewMode === "list" ? "default" : "outline"} onClick={() => setViewMode("list")}>List</Button>
          <Button variant={viewMode === "agenda" ? "default" : "outline"} onClick={() => setViewMode("agenda")}>Agenda</Button>
        </div>
      </section>

      <main>
        {viewMode === "kanban" ? (
          <MaintenanceKanban tasks={filteredTasks} onOpenTask={handleOpenTask} />
        ) : (
          // Reuse list/card for now; agenda can be added later
          <div className={viewMode === "card" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : ""}>
            <MaintenanceList tasks={filteredTasks} onOpenTask={handleOpenTask} />
          </div>
        )}
      </main>
    </div>
  );
};

export default MaintenanceDashboardContainer;
