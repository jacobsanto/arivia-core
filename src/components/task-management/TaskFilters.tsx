
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TaskFilters as TaskFiltersType, TaskStatus, TaskPriority } from '@/types/task-management';

interface TaskFiltersProps {
  filters: TaskFiltersType;
  onFiltersChange: (filters: TaskFiltersType) => void;
  onClearFilters: () => void;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  const updateFilter = (key: keyof TaskFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={filters.status?.[0] || ''}
              onValueChange={(value) => updateFilter('status', value ? [value as TaskStatus] : undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={filters.priority?.[0] || ''}
              onValueChange={(value) => updateFilter('priority', value ? [value as TaskPriority] : undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="role">Assigned Role</Label>
            <Select
              value={filters.assigned_role?.[0] || ''}
              onValueChange={(value) => updateFilter('assigned_role', value ? [value] : undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All roles</SelectItem>
                <SelectItem value="housekeeping_staff">Housekeeping</SelectItem>
                <SelectItem value="maintenance_staff">Maintenance</SelectItem>
                <SelectItem value="concierge">Concierge</SelectItem>
                <SelectItem value="property_manager">Property Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="due_date_from">Due Date From</Label>
            <Input
              id="due_date_from"
              type="date"
              value={filters.due_date_from || ''}
              onChange={(e) => updateFilter('due_date_from', e.target.value || undefined)}
            />
          </div>

          <div>
            <Label htmlFor="due_date_to">Due Date To</Label>
            <Input
              id="due_date_to"
              type="date"
              value={filters.due_date_to || ''}
              onChange={(e) => updateFilter('due_date_to', e.target.value || undefined)}
            />
          </div>
        </div>

        <Button variant="outline" onClick={onClearFilters} className="w-full">
          Clear Filters
        </Button>
      </CardContent>
    </Card>
  );
};

export default TaskFilters;
