import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, Building2, Filter } from 'lucide-react';
import { AnalyticsFilters, DATE_RANGE_OPTIONS } from '@/types/analytics.types';

interface AnalyticsFiltersProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: Partial<AnalyticsFilters>) => void;
  properties: Array<{ id: string; name: string }>;
  loading: boolean;
}

export const AnalyticsFiltersCard: React.FC<AnalyticsFiltersProps> = ({
  filters,
  onFiltersChange,
  properties,
  loading
}) => {
  const [localStartDate, setLocalStartDate] = useState(filters.startDate || '');
  const [localEndDate, setLocalEndDate] = useState(filters.endDate || '');

  const handleDateRangeChange = (value: string) => {
    if (value === 'custom') {
      onFiltersChange({ dateRange: value as AnalyticsFilters['dateRange'] });
    } else {
      onFiltersChange({ 
        dateRange: value as AnalyticsFilters['dateRange'],
        startDate: undefined,
        endDate: undefined
      });
    }
  };

  const handlePropertyChange = (value: string) => {
    onFiltersChange({ 
      propertyId: value === 'all' ? undefined : value 
    });
  };

  const applyCustomDates = () => {
    if (localStartDate && localEndDate) {
      onFiltersChange({
        startDate: localStartDate,
        endDate: localEndDate
      });
    }
  };

  useEffect(() => {
    setLocalStartDate(filters.startDate || '');
    setLocalEndDate(filters.endDate || '');
  }, [filters.startDate, filters.endDate]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Analytics Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Date Range */}
          <div className="space-y-2">
            <Label htmlFor="date-range" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Date Range
            </Label>
            <Select
              value={filters.dateRange}
              onValueChange={handleDateRangeChange}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_RANGE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Property Filter */}
          <div className="space-y-2">
            <Label htmlFor="property" className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              Property
            </Label>
            <Select
              value={filters.propertyId || 'all'}
              onValueChange={handlePropertyChange}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                {properties.map(property => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Range Inputs */}
          {filters.dateRange === 'custom' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={localStartDate}
                  onChange={(e) => setLocalStartDate(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <div className="flex gap-2">
                  <Input
                    id="end-date"
                    type="date"
                    value={localEndDate}
                    onChange={(e) => setLocalEndDate(e.target.value)}
                    disabled={loading}
                  />
                  <Button
                    size="sm"
                    onClick={applyCustomDates}
                    disabled={!localStartDate || !localEndDate || loading}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};