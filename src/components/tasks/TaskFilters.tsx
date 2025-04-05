
import React from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePermissions } from "@/hooks/usePermissions";

interface TaskFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeTab: string;
  onTabChange: (value: string) => void;
  onPropertyFilter: (value: string) => void;
  onTypeFilter: (value: string) => void;
}

const TaskFilters = ({
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  onPropertyFilter
}: TaskFiltersProps) => {
  const isMobile = useIsMobile();
  const { canAccess } = usePermissions();
  const isManager = canAccess('manage_housekeeping');
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex-1" />
        <select 
          onChange={(e) => onPropertyFilter(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Properties</option>
          <option value="Villa Caldera">Villa Caldera</option>
          <option value="Villa Sunset">Villa Sunset</option>
          <option value="Villa Oceana">Villa Oceana</option>
          <option value="Villa Paradiso">Villa Paradiso</option>
          <option value="Villa Azure">Villa Azure</option>
        </select>
      </div>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={onTabChange}
        className="w-full"
      >
        <TabsList className={`grid w-full ${isManager ? 'grid-cols-5' : 'grid-cols-4'}`}>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="inProgress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          {isManager && <TabsTrigger value="needsApproval">Needs Approval</TabsTrigger>}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default TaskFilters;
