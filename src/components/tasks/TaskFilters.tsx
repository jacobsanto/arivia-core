
import React from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePermissions } from "@/hooks/usePermissions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRealProperties } from "@/hooks/useRealProperties";
import { Skeleton } from "@/components/ui/skeleton";

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
  const { properties, isLoading } = useRealProperties();
  
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
        {isLoading ? (
          <Skeleton className="h-9 w-[180px]" />
        ) : (
          <select 
            onChange={(e) => onPropertyFilter(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Properties</option>
            {Array.isArray(properties) && properties.map(property => (
              <option key={property.id} value={property.name}>
                {property.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={onTabChange}
        className="w-full"
      >
        {isMobile ? (
          <ScrollArea orientation="horizontal" className="w-full pb-2">
            <TabsList className="inline-flex w-auto min-w-full">
              <TabsTrigger value="all" className="whitespace-nowrap px-3">All</TabsTrigger>
              <TabsTrigger value="pending" className="whitespace-nowrap px-3">Pending</TabsTrigger>
              <TabsTrigger value="inProgress" className="whitespace-nowrap px-3">In Progress</TabsTrigger>
              <TabsTrigger value="completed" className="whitespace-nowrap px-3">Completed</TabsTrigger>
              {isManager && <TabsTrigger value="needsApproval" className="whitespace-nowrap px-3">Needs Approval</TabsTrigger>}
            </TabsList>
          </ScrollArea>
        ) : (
          <TabsList className={`grid w-full ${isManager ? 'grid-cols-5' : 'grid-cols-4'}`}>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="inProgress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            {isManager && <TabsTrigger value="needsApproval">Needs Approval</TabsTrigger>}
          </TabsList>
        )}
      </Tabs>
    </div>
  );
};

export default TaskFilters;
