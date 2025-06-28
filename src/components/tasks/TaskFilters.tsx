
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { usePermissions } from '@/hooks/usePermissions';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

interface TaskFiltersProps {
  filters: {
    status?: string;
    priority?: string;
    assignedTo?: string;
    property?: string;
    dateRange?: [Date | null, Date | null];
    search?: string;
  };
  onFiltersChange: (filters: any) => void;
  onClear: () => void;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  filters,
  onFiltersChange,
  onClear
}) => {
  const { canAccess } = usePermissions();

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== null
  );

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-background">
      <div className="flex items-center justify-between">
        <h3 className="font-medium flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <Input
          placeholder="Search tasks..."
          value={filters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />

        {/* Status Filter */}
        <Select value={filters.status || ''} onValueChange={(value) => 
          handleFilterChange('status', value || undefined)
        }>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select value={filters.priority || ''} onValueChange={(value) => 
          handleFilterChange('priority', value || undefined)
        }>
          <SelectTrigger>
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateRange?.[0] && filters.dateRange?.[1] ? (
                `${format(filters.dateRange[0], 'PPP')} - ${format(filters.dateRange[1], 'PPP')}`
              ) : (
                'Select date range'
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={{
                from: filters.dateRange?.[0] || undefined,
                to: filters.dateRange?.[1] || undefined
              }}
              onSelect={(range) => {
                handleFilterChange('dateRange', range ? [range.from, range.to] : undefined);
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Additional filters for managers */}
      {canAccess('viewAllTasks') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Assigned To Filter */}
          <Select value={filters.assignedTo || ''} onValueChange={(value) => 
            handleFilterChange('assignedTo', value || undefined)
          }>
            <SelectTrigger>
              <SelectValue placeholder="Assigned to" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Assignees</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {/* Add actual team members here */}
            </SelectContent>
          </Select>

          {/* Property Filter */}
          <Select value={filters.property || ''} onValueChange={(value) => 
            handleFilterChange('property', value || undefined)
          }>
            <SelectTrigger>
              <SelectValue placeholder="Property" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Properties</SelectItem>
              {/* Add actual properties here */}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default TaskFilters;
