
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface TaskFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onPropertyFilter?: (property: string) => void;
  onTypeFilter?: (type: string) => void;
}

const TaskFilters = ({
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  onPropertyFilter,
  onTypeFilter,
}: TaskFiltersProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          {onPropertyFilter && (
            <Select onValueChange={onPropertyFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Properties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                <SelectItem value="Villa Caldera">Villa Caldera</SelectItem>
                <SelectItem value="Villa Azure">Villa Azure</SelectItem>
                <SelectItem value="Villa Sunset">Villa Sunset</SelectItem>
                <SelectItem value="Villa Oceana">Villa Oceana</SelectItem>
              </SelectContent>
            </Select>
          )}
          
          {onTypeFilter && (
            <Select onValueChange={onTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Housekeeping">Housekeeping</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Inventory">Inventory</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <Tabs
        defaultValue={activeTab}
        className="w-full"
        onValueChange={onTabChange}
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="inProgress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default TaskFilters;
