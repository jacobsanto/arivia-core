
import React from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MaintenanceFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeTab: string;
  onTabChange: (value: string) => void;
  onPropertyFilter: (value: string) => void;
  onPriorityFilter: (value: string) => void;
}

const MaintenanceFilters = ({
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  onPropertyFilter,
  onPriorityFilter,
}: MaintenanceFiltersProps) => {
  const properties = ["Villa Caldera", "Villa Azure", "Villa Sunset", "Villa Oceana"];
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Input
          placeholder="Search tasks..."
          className="w-full sm:w-80"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Select onValueChange={(value) => onPropertyFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {properties.map((property) => (
                <SelectItem key={property} value={property}>
                  {property}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select onValueChange={(value) => onPriorityFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        {isMobile ? (
          <ScrollArea orientation="horizontal" className="w-full pb-2">
            <TabsList className="inline-flex w-auto min-w-full">
              <TabsTrigger value="all" className="whitespace-nowrap px-3">All</TabsTrigger>
              <TabsTrigger value="pending" className="whitespace-nowrap px-3">Pending</TabsTrigger>
              <TabsTrigger value="inProgress" className="whitespace-nowrap px-3">In Progress</TabsTrigger>
              <TabsTrigger value="completed" className="whitespace-nowrap px-3">Completed</TabsTrigger>
            </TabsList>
          </ScrollArea>
        ) : (
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="all" className="flex-1 sm:flex-none">All</TabsTrigger>
            <TabsTrigger value="pending" className="flex-1 sm:flex-none">Pending</TabsTrigger>
            <TabsTrigger value="inProgress" className="flex-1 sm:flex-none">In Progress</TabsTrigger>
            <TabsTrigger value="completed" className="flex-1 sm:flex-none">Completed</TabsTrigger>
          </TabsList>
        )}
      </Tabs>
    </div>
  );
};

export default MaintenanceFilters;
