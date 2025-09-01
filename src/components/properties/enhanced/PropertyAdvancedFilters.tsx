import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PropertyFilters, PropertyViewMode } from "@/types/property-detailed.types";
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List,
  X,
  Plus,
  Settings,
  ArrowUpDown
} from "lucide-react";

interface PropertyAdvancedFiltersProps {
  filters: PropertyFilters;
  viewMode: PropertyViewMode;
  activeFiltersCount: number;
  onFilterChange: (key: keyof PropertyFilters, value: any) => void;
  onViewModeChange: (update: Partial<PropertyViewMode>) => void;
  onClearFilters: () => void;
  onCreateProperty: () => void;
}

export const PropertyAdvancedFilters: React.FC<PropertyAdvancedFiltersProps> = ({
  filters,
  viewMode,
  activeFiltersCount,
  onFilterChange,
  onViewModeChange,
  onClearFilters,
  onCreateProperty
}) => {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Property Filters</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount} active
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg border p-1">
              <Button
                variant={viewMode.mode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 px-3"
                onClick={() => onViewModeChange({ mode: 'grid' })}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode.mode === 'list' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 px-3"
                onClick={() => onViewModeChange({ mode: 'list' })}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <Button onClick={onCreateProperty} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search properties by name or address..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Status</Label>
            <Select value={filters.status} onValueChange={(value) => onFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="vacant">Vacant</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Room Status Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Room Status</Label>
            <Select value={filters.room_status} onValueChange={(value) => onFilterChange('room_status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All room statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Room Statuses</SelectItem>
                <SelectItem value="dirty">Dirty</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
                <SelectItem value="cleaned">Cleaned</SelectItem>
                <SelectItem value="inspected">Inspected</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Property Type Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Property Type</Label>
            <Select value={filters.property_type} onValueChange={(value) => onFilterChange('property_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="house">House</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bedrooms Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Bedrooms</Label>
            <Select value={filters.bedrooms} onValueChange={(value) => onFilterChange('bedrooms', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any</SelectItem>
                <SelectItem value="1">1 Bedroom</SelectItem>
                <SelectItem value="2">2 Bedrooms</SelectItem>
                <SelectItem value="3">3 Bedrooms</SelectItem>
                <SelectItem value="4">4+ Bedrooms</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Options (for list view) */}
          {viewMode.mode === 'list' && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Sort By</Label>
              <Select 
                value={`${viewMode.sort_by}-${viewMode.sort_direction}`} 
                onValueChange={(value) => {
                  const [sort_by, sort_direction] = value.split('-') as [PropertyViewMode['sort_by'], PropertyViewMode['sort_direction']];
                  onViewModeChange({ sort_by, sort_direction });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="status-asc">Status (A-Z)</SelectItem>
                  <SelectItem value="status-desc">Status (Z-A)</SelectItem>
                  <SelectItem value="room_status-asc">Room Status (A-Z)</SelectItem>
                  <SelectItem value="room_status-desc">Room Status (Z-A)</SelectItem>
                  <SelectItem value="issues-desc">Most Issues</SelectItem>
                  <SelectItem value="issues-asc">Least Issues</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Clear Filters Button */}
          <div className="space-y-2">
            <Label className="text-sm font-medium opacity-0">Actions</Label>
            <div className="flex gap-2">
              {activeFiltersCount > 0 && (
                <Button variant="outline" size="sm" onClick={onClearFilters} className="flex-1">
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Additional Options */}
        <div className="flex items-center space-x-4 pt-2 border-t">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has_issues"
              checked={filters.has_issues}
              onCheckedChange={(checked) => onFilterChange('has_issues', checked)}
            />
            <Label htmlFor="has_issues" className="text-sm">
              Show only properties with open issues
            </Label>
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            <div className="flex flex-wrap gap-1">
              {filters.status !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Status: {filters.status}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1 hover:bg-transparent"
                    onClick={() => onFilterChange('status', 'all')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.room_status !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Room: {filters.room_status}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1 hover:bg-transparent"
                    onClick={() => onFilterChange('room_status', 'all')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.property_type !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Type: {filters.property_type}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1 hover:bg-transparent"
                    onClick={() => onFilterChange('property_type', 'all')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.bedrooms !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Bedrooms: {filters.bedrooms}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1 hover:bg-transparent"
                    onClick={() => onFilterChange('bedrooms', 'all')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.has_issues && (
                <Badge variant="secondary" className="text-xs">
                  Has Issues
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1 hover:bg-transparent"
                    onClick={() => onFilterChange('has_issues', false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};