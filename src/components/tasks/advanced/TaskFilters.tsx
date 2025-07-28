import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";
import { Card } from "@/components/ui/card";

interface TaskFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  priorityFilter: string;
  onPriorityChange: (value: string) => void;
  assigneeFilter: string;
  onAssigneeChange: (value: string) => void;
  propertyFilter: string;
  onPropertyChange: (value: string) => void;
  taskTypeFilter: string;
  onTaskTypeChange: (value: string) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

const TaskFilters = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  assigneeFilter,
  onAssigneeChange,
  propertyFilter,
  onPropertyChange,
  taskTypeFilter,
  onTaskTypeChange,
  onClearFilters,
  activeFiltersCount
}: TaskFiltersProps) => {
  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium">Filters</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFiltersCount} active
            </Badge>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select value={priorityFilter} onValueChange={onPriorityChange}>
          <SelectTrigger>
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>

        {/* Task Type Filter */}
        <Select value={taskTypeFilter} onValueChange={onTaskTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Task Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Standard Cleaning">Standard Cleaning</SelectItem>
            <SelectItem value="Full Cleaning">Full Cleaning</SelectItem>
            <SelectItem value="Linen & Towel Change">Linen Change</SelectItem>
            <SelectItem value="Maintenance">Maintenance</SelectItem>
            <SelectItem value="Inspection">Inspection</SelectItem>
          </SelectContent>
        </Select>

        {/* Assignee Filter */}
        <Select value={assigneeFilter} onValueChange={onAssigneeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            <SelectItem value="me">Assigned to Me</SelectItem>
          </SelectContent>
        </Select>

        {/* Property Filter */}
        <Select value={propertyFilter} onValueChange={onPropertyChange}>
          <SelectTrigger>
            <SelectValue placeholder="Property" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
};

export default TaskFilters;