
import React from "react";
import { MaintenanceTask } from "@/types/maintenanceTypes";
import MaintenanceOverviewCards from "./MaintenanceOverviewCards";
import StatusPieChart from "./StatusPieChart";
import PriorityPieChart from "./PriorityPieChart";
import PropertyBarChart from "./PropertyBarChart";

interface MaintenanceStatsProps {
  tasks: MaintenanceTask[];
}

/**
 * Main component for displaying maintenance statistics
 */
const MaintenanceStats = ({ tasks }: MaintenanceStatsProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Maintenance Stats</h2>
      
      {/* Summary Cards */}
      <MaintenanceOverviewCards tasks={tasks} />
      
      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Status Distribution */}
        <StatusPieChart tasks={tasks} />
        
        {/* Priority Distribution */}
        <PriorityPieChart tasks={tasks} />
        
        {/* Property Distribution */}
        <PropertyBarChart tasks={tasks} />
      </div>
    </div>
  );
};

export default MaintenanceStats;
