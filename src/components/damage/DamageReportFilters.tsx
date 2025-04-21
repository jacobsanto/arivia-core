
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProperties } from "@/hooks/useProperties";

interface DamageReportFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  propertyFilter: string;
  onPropertyFilter: (property: string) => void;
  statusFilter: string;
  onStatusFilter: (status: string) => void;
}

const DamageReportFilters: React.FC<DamageReportFiltersProps> = ({
  searchQuery,
  onSearchChange,
  propertyFilter,
  onPropertyFilter,
  statusFilter,
  onStatusFilter,
}) => {
  const { properties } = useProperties();

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
      <Input
        placeholder="Search reports..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="md:w-1/3"
      />

      <Select value={propertyFilter || "all"} onValueChange={onPropertyFilter}>
        <SelectTrigger className="md:w-1/4">
          <SelectValue placeholder="Filter by property" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Properties</SelectItem>
          {properties.map((property) => (
            <SelectItem key={property.id} value={property.id}>
              {property.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={statusFilter || "all"} onValueChange={onStatusFilter}>
        <SelectTrigger className="md:w-1/4">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="investigating">Investigating</SelectItem>
          <SelectItem value="resolved">Resolved</SelectItem>
          <SelectItem value="compensation_required">Compensation Required</SelectItem>
          <SelectItem value="compensation_paid">Compensation Paid</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default DamageReportFilters;
