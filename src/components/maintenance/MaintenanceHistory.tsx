
import React from "react";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MaintenanceTask } from "@/hooks/useMaintenanceTasks";
import { DateRangeFilter } from "@/types/maintenanceTypes";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CalendarIcon, FilterX } from "lucide-react";
import MaintenanceCard from "./MaintenanceCard";

interface MaintenanceHistoryProps {
  tasks: MaintenanceTask[];
  dateRangeFilter: DateRangeFilter;
  onDateRangeChange: (range: DateRangeFilter) => void;
  onClearFilters: () => void;
  onOpenTask: (task: MaintenanceTask) => void;
}

const MaintenanceHistory = ({ 
  tasks, 
  dateRangeFilter, 
  onDateRangeChange, 
  onClearFilters,
  onOpenTask 
}: MaintenanceHistoryProps) => {
  const { startDate, endDate } = dateRangeFilter;
  
  const formattedDateRange = () => {
    if (startDate && endDate) {
      return `${format(startDate, 'PPP')} to ${format(endDate, 'PPP')}`;
    }
    return "Select date range";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Maintenance History</h2>
        
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                {formattedDateRange()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50" align="end">
              <Calendar
                mode="range"
                selected={{
                  from: startDate || undefined,
                  to: endDate || undefined
                }}
                onSelect={(range) => {
                  onDateRangeChange({
                    startDate: range?.from || null,
                    endDate: range?.to || null
                  });
                }}
                initialFocus
                numberOfMonths={1}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClearFilters}
            title="Clear filters"
          >
            <FilterX className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {tasks.length === 0 ? (
        <Card className="p-8 text-center">
          <CardHeader>
            <CardTitle>No maintenance records found</CardTitle>
            <CardDescription>
              Try adjusting your filters or create a new maintenance task.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tasks.map((task) => (
            <MaintenanceCard key={task.id} task={task} onClick={() => onOpenTask(task)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MaintenanceHistory;
