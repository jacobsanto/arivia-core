import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserFilters, ROLE_LABELS } from '@/types/userManagement.types';
import { AppRole } from '@/types/permissions.types';

interface UserFiltersProps {
  filters: UserFilters;
  onFiltersChange: (filters: Partial<UserFilters>) => void;
}

const UserFiltersComponent = ({ filters, onFiltersChange }: UserFiltersProps) => {
  const roles: AppRole[] = ['superadmin', 'administrator', 'property_manager', 'housekeeping_staff', 'maintenance_staff', 'guest'];

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search by name or email..."
          value={filters.searchQuery}
          onChange={(e) => onFiltersChange({ searchQuery: e.target.value })}
          className="pl-10"
        />
      </div>

      {/* Role Filter */}
      <Select
        value={filters.roleFilter}
        onValueChange={(value) => onFiltersChange({ roleFilter: value as AppRole | 'all' })}
      >
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Filter by role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          {roles.map((role) => (
            <SelectItem key={role} value={role}>
              {ROLE_LABELS[role]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default UserFiltersComponent;