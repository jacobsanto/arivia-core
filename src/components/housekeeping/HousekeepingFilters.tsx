
import React from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "@/components/reports/DateRangeSelector";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

interface HousekeepingFiltersProps {
  taskTypeFilter: string;
  setTaskTypeFilter: (value: string) => void;
  assignedToFilter: string;
  setAssignedToFilter: (value: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  taskTypeOptions: string[];
  staffOptions: string[];
}

const HousekeepingFilters: React.FC<HousekeepingFiltersProps> = ({
  taskTypeFilter,
  setTaskTypeFilter,
  assignedToFilter,
  setAssignedToFilter,
  dateRange,
  setDateRange,
  taskTypeOptions,
  staffOptions,
}) => {
  const isMobile = useIsMobile();
  
  const FiltersContent = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Task Type</label>
          <Select value={taskTypeFilter} onValueChange={setTaskTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Task Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Task Types</SelectItem>
              {taskTypeOptions.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Assigned To</label>
          <Select value={assignedToFilter} onValueChange={setAssignedToFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Staff" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Staff</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {staffOptions.map(staff => (
                <SelectItem key={staff} value={staff}>{staff}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Due Date Range</label>
          <DatePickerWithRange 
            value={dateRange} 
            onChange={setDateRange}
          />
        </div>
      </div>
    </div>
  );

  // Mobile view uses a sheet for filters
  if (isMobile) {
    return (
      <div className="mb-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full flex justify-between">
              <span>Filters</span>
              <Filter className="h-4 w-4 ml-2" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader className="mb-4">
              <SheetTitle>Filter Tasks</SheetTitle>
              <SheetDescription>
                Apply filters to narrow down the housekeeping tasks
              </SheetDescription>
            </SheetHeader>
            <Separator className="my-4" />
            <FiltersContent />
          </SheetContent>
        </Sheet>
      </div>
    );
  }
  
  // Desktop view shows filters directly
  return (
    <div className="bg-card rounded-md border p-4 mb-6">
      <h2 className="font-medium mb-4">Filters</h2>
      <FiltersContent />
    </div>
  );
};

export default HousekeepingFilters;
